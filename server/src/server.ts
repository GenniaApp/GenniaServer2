import express from 'express';
import { Request, Response } from 'express';
import { Server, Socket } from 'socket.io';

import { forceStartOK } from './lib/constants';
import { roomPool, createRoom, leaveRoom } from './lib/room-pool';
import { Room, LeaderBoardData } from './lib/types';
import Point from './lib/point';
import Player from './lib/player';
import GameMap from './lib/map';
import xss from 'xss';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));

app.get('/get_rooms', (req: Request, res: Response) => {
  res.status(200).json(roomPool);
});


const server = app.listen(3001, () => {
  console.log('Application started on port 3001!');
});

const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for testing purposes. This should be changed on production.
    // origin: "http://localhost:3000"
  },
});

async function handleDisconnectInGame(room: Room, player: Player, io: Server) {
  try {
    io.in(room.id).emit('room_message', player, 'quit.');
    room.players = room.players.filter((p) => p.id != player.id);
  } catch (e: any) {
    console.log(e.message);
  }
}

async function handleDisconnectInRoom(room: Room, player: Player, io: Server) {
  try {
    io.in(room.id).emit('room_message', player, 'quit.');
    let newPlayers = [];
    room.forceStartNum = 0;
    for (let i = 0, c = 0; i < room.players.length; ++i) {
      if (room.players[i].id !== player.id) {
        room.players[i].color = c++;
        newPlayers.push(room.players[i]);
        if (room.players[i].forceStart) {
          ++room.forceStartNum;
        }
      }
    }
    room.players = newPlayers;
    if (room.players.length > 0) room.players[0].setRoomHost(true);
    // todo : fixed
    io.in(room.id).emit('room_info_update', room);
  } catch (e: any) {
    console.log(e.message);
  }
}

async function getPlayerIndex(room: Room, playerId: string) {
  for (let i = 0; i < room.players.length; ++i) {
    if (room.players[i].id === playerId) {
      return i;
    }
  }
  return -1;
}

async function getPlayerIndexBySocket(room: Room, socketId: string) {
  for (let i = 0; i < room.players.length; ++i) {
    if (room.players[i].socket_id === socketId) {
      return i;
    }
  }
  return -1;
}

async function handleGame(room: Room, io: Server) {
  if (room.gameStarted === false) {
    console.info(`Start game`);
    for (let [id, socket] of io.sockets.sockets) {
      let playerIndex = await getPlayerIndexBySocket(room, id);
      if (playerIndex !== -1) {
        socket.emit('game_started', room.players[playerIndex].color);
      }
    }
    room.gameStarted = true;

    room.map = new GameMap(
      'random_map_id',
      'random_map_name',
      room.mapWidth,
      room.mapHeight,
      room.mountain,
      room.city,
      room.swamp,
      room.players
    );
    room.players = await room.map.generate();
    room.mapGenerated = true;

    io.in(room.id).emit('init_game_map', room.map.width, room.map.height);

    for (let [id, socket] of io.sockets.sockets) {
      socket.on('attack', async (from: Point, to: Point, isHalf: boolean) => {
        let playerIndex = await getPlayerIndexBySocket(room, id);
        if (playerIndex !== -1) {
          let player = room.players[playerIndex];
          if (
            room.map &&
            player.operatedTurn < room.map.turn &&
            room.map.commandable(player, from, to)
          ) {
            if (isHalf) {
              room.map.moveHalfMovableUnit(player, from, to);
            } else {
              room.map.moveAllMovableUnit(player, from, to);
            }

            room.players[playerIndex].operatedTurn = room.map.turn;
            socket.emit('attack_success', from, to);
          } else {
            socket.emit('attack_failure', from, to);
          }
        }
      });
    }

    let updTime = 500 / room.gameSpeed;
    room.gameLoop = setInterval(async () => {
      try {
        room.players.forEach(async (player) => {
          if (!room.map) throw new Error('king is null');
          let block = room.map.getBlock(player.king);

          let blockPlayerIndex = await getPlayerIndex(room, block.player.id);
          if (blockPlayerIndex !== -1) {
            if (block.player !== player && player.isDead === false) {
              console.log(block.player.username, 'captured', player.username);
              io.in(room.id).emit('captured', block.player, player);
              let player_socket = io.sockets.sockets.get(player.socket_id);
              if (player_socket) {
                player_socket.emit('game_over', block.player);
              } else {
                throw new Error('socket is null');
              }
              player.isDead = true;
              room.map.getBlock(player.king).kingBeDominated();
              player.land.forEach((block) => {
                if (!room.map) throw new Error('map is null');
                room.map.transferBlock(block, room.players[blockPlayerIndex]);
                room.players[blockPlayerIndex].winLand(block);
              });
              player.land.length = 0;
            }
          }
        });
        let alivePlayer = null,
          countAlive = 0;
        for (let a of room.players)
          if (!a.isDead) (alivePlayer = a), ++countAlive;
        if (countAlive === 1) {
          if (!alivePlayer) throw new Error('alivePlayer is null');
          io.in(room.id).emit('game_ended', alivePlayer.id);
          room.gameStarted = false;
          room.forceStartNum = 0;
          console.log('Game ended');
          clearInterval(room.gameLoop);
        }

        let leaderBoard: LeaderBoardData = room.players
          .map((player) => {
            if (!room.map) throw new Error('Map is not generated');
            let data = room.map.getTotal(player);
            return {
              color: player.color,
              username: player.username,
              armyCount: data.army,
              landsCount: data.land,
            };
          })
          .sort((a, b) => {
            return b.armyCount - a.armyCount || b.landsCount - a.landsCount;
          });

        if (!room.map) throw new Error('Map is not generated');

        for (let [id, socket] of io.sockets.sockets) {
          let playerIndex = await getPlayerIndexBySocket(room, id);
          if (playerIndex !== -1) {
            let mapData = await room.map.getViewPlayer(
              room.players[playerIndex]
            );

            socket.emit(
              'game_update',
              JSON.stringify(mapData), //todo
              room.map.width,
              room.map.height,
              room.map.turn,
              leaderBoard
            );
          }
        }
        room.map.updateTurn();
        room.map.updateUnit();
      } catch (e: any) {
        console.log(e.message);
      }
    }, updTime);
  }
}

function reject_join(socket: Socket, msg: string) {
  socket.emit('reject_join', msg);
  socket.disconnect();
}

// =====================
// main
// =====================


io.on('connection', async (socket) => {
  // ====================================
  // init
  // ====================================
  let room: Room;
  let player: Player;

  console.log(`new ${socket.id} connected`);


  let params = socket.handshake.query;

  let username = Array.isArray(params.username) ? params.username[0] : params.username
  let roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId


  // validate roomId and username
  if (Array.isArray(username) || !username) {
    reject_join(socket, `username ${username} is invalid.`);
    return;
  }
  username = xss(username);
  if (!username.length) {
    reject_join(socket, `Xss Username: ${username} is invalid`);
    return;
  }
  if (Array.isArray(roomId) || !roomId) {
    reject_join(socket, `Room id: ${roomId} is invalid.`);
    return;
  }

  if (!roomPool[roomId]) {
    reject_join(socket, `Room id: ${roomId} is not existed.`);
    return;
  }

  room = roomPool[roomId];
  // check room status
  if (room.players.length >= room.maxPlayers)
    reject_join(socket, 'The room is full.');
  else {
    socket.join(roomId as string);
  }
  if (room.gameStarted) {
    socket.emit('reject_join', 'Game is already started');
    return;
  }
  let playerId = crypto
    .randomBytes(Math.ceil(10 / 2))
    .toString('hex')
    .slice(0, 10);
  console.log(
    `Connect! Socket ${socket.id}, room ${roomId} name ${username} playerId ${playerId}`
  );

  player = new Player(playerId, socket.id, username, room.players.length);

  if (room.players.length === 0) {
    player.setRoomHost(true);
  }

  socket.emit('set_player_id', player.id);

  room.players.push(player);

  // boardcast new player message to room
  io.in(room.id).emit('room_message', player, 'joined the lobby.');
  io.in(room.id).emit('room_info_update', room);
  console.log(player.username, 'joined the room.');
  console.log(`room ${room.roomName} has ${room.players.length} players`);
  // console.log(room)

  if (room.players.length >= room.maxPlayers) {
    await handleGame(room, io);
  }

  // ====================================
  // set up socket event listeners
  // ====================================
  socket.on('reconnect', async (playerId) => {
    try {
      // Allow to reconnect
      let playerIndex = await getPlayerIndex(room, playerId);
      if (playerIndex !== -1 && playerId !== player.id) {
        room.players = room.players.filter((p) => p !== player);
        player = room.players[playerIndex];
        room.players[playerIndex].socket_id = socket.id;
        io.in(room.id).emit('room_message', player, 're-joined the lobby.');
        io.in(room.id).emit('room_info_update', room);
      } else {
        socket.emit('delete_local_reconnect');
      }
    } catch (err: any) {
      socket.emit(
        'error',
        'An unknown error occurred: ' + err.message,
        err.stack
      );
    }
  });

  socket.on('get_room_info', async () => {
    socket.emit('room_info_update', room);
  });

  socket.on('change_host', async (userId) => {
    try {
      if (!player.isRoomHost) {
        throw new Error('You are not the room host.');
      }
      let currentHost = await getPlayerIndex(room, player.id);
      let newHost = await getPlayerIndex(room, userId);
      if (newHost !== -1) {
        room.players[currentHost].setRoomHost(false);
        room.players[newHost].setRoomHost(true);
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `transfer host to ${room.players[newHost].username}.`
        );
      } else {
        throw new Error('Target player not found.');
      }
    } catch (e: any) {
      console.log(e.message);
      socket.emit('error', 'Host changement failed', e.message);
    }
  });

  socket.on('change_game_speed', async (value) => {
    console.log('Temp: Changing game speed to ' + value + 'x');
    try {
      if (player.isRoomHost) {
        console.log('Changing game speed to ' + value + 'x');
        room.gameSpeed = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the game speed to ${value}x.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_map_width', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing map width to' + value);
        room.mapWidth = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the map width to ${value}.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_map_height', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing map height to' + value);
        room.mapHeight = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the map height to ${value}.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_mountain', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing mountain to' + value);
        room.mountain = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the mountain to ${value}.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_city', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing city to' + value);
        room.city = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the city to ${value}.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_swamp', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing swamp to' + value);
        room.swamp = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the swamp to ${value}.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_max_player_num', async (value) => {
    try {
      if (player.isRoomHost) {
        if (value <= 1) {
          socket.emit(
            'error',
            'Changement was failed',
            'Max player num is invalid.'
          );
          return;
        }
        console.log('Changing max players to' + value);
        room.maxPlayers = value;
        io.in(room.id).emit('room_info_update', room);
        io.in(room.id).emit(
          'room_message',
          player,
          `changed the max player num to ${value}.`
        );
      } else {
        socket.emit(
          'error',
          'Changement was failed',
          'You are not the game host.'
        );
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('player_message', async (message) => {
    io.in(room.id).emit('room_message', player, ': ' + message);
  });

  socket.on('disconnect', async () => {
    if (!room.gameStarted) await handleDisconnectInRoom(room, player, io);
    else await handleDisconnectInGame(room, player, io);
  });

  socket.on('leave_game', async () => {
    try {
      socket.disconnect();
      await handleDisconnectInGame(room, player, io);
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('force_start', async () => {
    try {
      let playerIndex = await getPlayerIndex(room, player.id);
      if (room.players[playerIndex].forceStart === true) {
        room.players[playerIndex].forceStart = false;
        --room.forceStartNum;
      } else {
        room.players[playerIndex].forceStart = true;
        ++room.forceStartNum;
      }
      io.in(room.id).emit('room_info_update', room);

      if (room.forceStartNum >= forceStartOK[room.players.length]) {
        await handleGame(room, io);
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });
});

