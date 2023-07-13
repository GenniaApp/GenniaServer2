import express from 'express';
import { Request, Response } from 'express';
import { Server, Socket } from 'socket.io';

import { forceStartOK } from './lib/constants';
import { roomPool, createRoom } from './lib/room-pool';
import { Room, LeaderBoardData, PlayerPrivateInfo } from './lib/types';
import { getPlayerIndex, getPlayerIndexBySocket } from './lib/utils';
import Point from './lib/point';
import Player from './lib/player';
import GameMap from './lib/map';
import xss from 'xss';
import crypto from 'crypto';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const cors_urls = process.env.CLIENT_URL == '*' ? '*' : process.env.CLIENT_URL.split(' ');
console.log(cors_urls);
app.use(cors({ origin: cors_urls }));

app.get('/get_rooms', (req: Request, res: Response) => {
  res.status(200).json(roomPool);
});

app.get('/create_room', async (req: Request, res: Response) => {
  let result = await createRoom();
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Application started on port ${process.env.PORT}!`);
});

const io = new Server(server, {
  cors: {
    origin: cors_urls,
  },
});

async function handleDisconnectInRoom(room: Room, player: Player, io: Server) {
  try {
    io.in(room.id).emit('room_message', player, 'quit.');
    room.players = room.players.filter((p) => p.id != player.id);

    room.forceStartNum = 0;
    for (let i = 0, c = 0; i < room.players.length; ++i) {
      if (room.players[i].forceStart) {
        ++room.forceStartNum;
      }
    }
    if (room.players.length < 1) {
      delete roomPool[room.id];
    } else {
      room.players[0].setRoomHost(true);
    }
    io.in(room.id).emit('update_room', room);
  } catch (e: any) {
    console.log(e.message);
  }
}

async function handleGame(room: Room, io: Server) {
  if (room.gameStarted === false) {
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

    // Now: Client can get map name / width / height !
    // todo 对于自定义地图，地图名称应该在游戏开始前获知，而不是开始时
    console.info(`Start game`);
    room.gameStarted = true;
    room.players.forEach((player) => {
      let player_socket = io.sockets.sockets.get(player.socket_id);
      if (player_socket) {
        let playerPrivateInfo: PlayerPrivateInfo = { king: { x: player.king.x, y: player.king.y } };
        player_socket.emit('game_started', playerPrivateInfo);
      }
    });

    io.in(room.id).emit('update_room', room);

    let updTime = 500 / room.gameSpeed;
    room.gameLoop = setInterval(async () => {
      // try {
      room.players.forEach(async (player) => {
        if (!room.map) throw new Error('king is null');
        if (!player.isDead) {
          let block = room.map.getBlock(player.king);
          let blockPlayerIndex = await getPlayerIndex(room, block.player.id);
          if (blockPlayerIndex !== -1) {
            if (block.player !== player && player.isDead === false) {
              console.log(block.player.username, 'captured', player.username);
              io.in(room.id).emit('captured', block.player, player);
              io.in(room.id).emit('room_message', block.player, `captured ${player.username}`);
              let player_socket = io.sockets.sockets.get(player.socket_id);
              if (player_socket) {
                player_socket.emit('game_over', block.player); // captured by block.player
              } else {
                throw new Error('socket is null');
              }
              player.isDead = true;
              room.map.getBlock(player.king).kingBeDominated();
              player.land.forEach((block) => {
                room.map.transferBlock(block, room.players[blockPlayerIndex]);
                room.players[blockPlayerIndex].winLand(block);
              });
              player.land.length = 0;
            }
          }
        }
      });

      let alivePlayer = null;
      let countAlive = 0;
      for (let player of room.players) {
        if (!player.isDead) {
          alivePlayer = player;
          ++countAlive;
        }
      }
      // Game over, Find Winner
      if (countAlive === 1) {
        if (!alivePlayer) throw new Error('alivePlayer is null');
        io.in(room.id).emit('game_ended', alivePlayer); // winnner
        console.log('Game ended');

        room.gameStarted = false;
        room.forceStartNum = 0;
        room.players.forEach((player) => {
          player.reset();
        });
        io.in(room.id).emit('update_room', room);

        clearInterval(room.gameLoop);
      }

      let leaderBoard: LeaderBoardData = room.players
        .map((player) => {
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

      let room_sockets = await io.in(room.id).fetchSockets();

      if (room.fogOfWar) {
        for (let socket of room_sockets) {
          let playerIndex = await getPlayerIndexBySocket(room, socket.id);
          if (playerIndex !== -1) {
            let mapData = await room.map.getViewPlayer(room.players[playerIndex]);
            // todo, if player is spectator, return all map data

            socket.emit(
              'game_update',
              mapData, //todo 减小数据量，例如只返回 diff
              room.map.turn,
              leaderBoard
            );
          }
        }
      } else {
        let mapData = await room.map.getMapData();
        io.in(room.id).emit('game_update', mapData, room.map.turn, leaderBoard);
      }

      room.map.updateTurn();
      room.map.updateUnit();
      // } catch (e: any) {
      //   console.log(e.message);
      // }
    }, updTime);
  }
}

function reject_join(socket: Socket, msg: string) {
  socket.emit('reject_join', msg);
  socket.disconnect();
}

function get_query_param(params: any, key: string) {
  if (Array.isArray(params[key])) {
    return params[key][0];
  } else {
    return params[key];
  }
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

  let username = get_query_param(params, 'username');
  let roomId = get_query_param(params, 'roomId');
  let myPlayerId = get_query_param(params, 'myPlayerId');

  console.log(`new connect: ${username} ${roomId} ${myPlayerId}`);

  // validate roomId and username
  if (!username) {
    reject_join(socket, `Username: ${username} is invalid`);
    return;
  }
  if (!roomId) {
    reject_join(socket, `roomId: ${username} is invalid`);
    return;
  }
  username = xss(username);
  if (!username.length) {
    reject_join(socket, `Xss Username: ${username} is invalid`);
    return;
  }
  if (!roomPool[roomId]) {
    try {
      await createRoom(roomId);
    } catch (e: any) {
      reject_join(socket, e.message);
    }
    // return;
  }
  room = roomPool[roomId];
  // check room status
  if (room.players.length >= room.maxPlayers) {
    reject_join(socket, 'The room is full.');
    return;
  } else {
    socket.join(roomId as string);
  }
  if (room.gameStarted) {
    socket.emit('reject_join', 'Game is already started');
    return;
  }

  let isValidReconnectPlayer = false;

  if (myPlayerId) {
    // reconnect or same user with multiple tabs
    // todo: unfinished 因为玩家 disconnect 后，对应的 id会被清空，需要区分正常退出（清除id）和异常退出（保留玩家id）的情况
    let playerIndex = await getPlayerIndex(room, myPlayerId);

    if (playerIndex !== -1) {
      isValidReconnectPlayer = true;
      room.players = room.players.filter((p) => p !== player);
      player = room.players[playerIndex];
      room.players[playerIndex].socket_id = socket.id;
      io.in(room.id).emit('room_message', player, 're-joined the lobby.');
      io.in(room.id).emit('update_room', room);
    }
  }

  if (!isValidReconnectPlayer) {
    let playerId = crypto
      .randomBytes(Math.ceil(10 / 2))
      .toString('hex')
      .slice(0, 10);
    console.log(`Connect! Socket ${socket.id}, room ${roomId} name ${username} playerId ${playerId}`);

    let playerColor = 0;
    for (let i = 0; i < room.players.length; ++i) {
      if (room.players[i].color === playerColor) {
        ++playerColor;
      }
    }
    player = new Player(playerId, socket.id, username, playerColor);

    if (room.players.length === 0) {
      player.setRoomHost(true);
    }

    socket.emit('set_player_id', player.id);

    room.players.push(player);

    // boardcast new player message to room
    io.in(room.id).emit('room_message', player, 'joined the room.');
    io.in(room.id).emit('update_room', room);

    if (room.players.length >= room.maxPlayers) {
      await handleGame(room, io);
    }
  }

  console.log(player.username, 'joined the room.');

  // ====================================
  // set up socket event listeners
  // ====================================

  socket.on('get_room_info', async () => {
    socket.emit('update_room', room);
  });

  socket.on('surrender', async (playerId) => {
    let playerIndex = await getPlayerIndex(room, playerId);
    if (playerIndex === -1) {
      socket.emit('error', 'Surrender failed', 'Player not found.');
      return;
    }
    player = room.players[playerIndex];
    console.log(`${player} surrendered`);

    room.map.getBlock(player.king).kingBeDominated();
    // 变成中立单元: todo 延迟一段时间再变为中立单元更合理
    player.land.forEach((block) => {
      block.beNeutralized();
    });
    player.land.length = 0;
    player.king = null;
    player.isDead = true;

    io.in(room.id).emit('room_message', player, 'surrendered');
  });

  socket.on('change_host', async (playerId) => {
    try {
      if (!player.isRoomHost) {
        throw new Error('You are not the room host.');
      }
      let currentHost = await getPlayerIndex(room, player.id);
      let newHost = await getPlayerIndex(room, playerId);
      if (newHost !== -1) {
        room.players[currentHost].setRoomHost(false);
        room.players[newHost].setRoomHost(true);
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `transfered host to ${room.players[newHost].username}.`);
      } else {
        throw new Error('Target player not found.');
      }
    } catch (e: any) {
      console.log(e.message);
      socket.emit('error', 'Host changement failed', e.message);
    }
  });

  socket.on('change_gameSpeed', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing game speed to ' + value + 'x');
        room.gameSpeed = value;
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the game speed to ${value}x.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_fogOfWar', async (value: boolean) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing fog of war to ' + value);
        room.fogOfWar = value;
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed fog of war to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_roomName', async (value) => {
    try {
      if (player.isRoomHost) {
        // value length should > 0 < 15
        if (value.length < 1 && value.length > 15) {
          throw new Error('Room name length should between [1, 15] .');
        }
        console.log('Changing room name to ' + value);
        room.roomName = value;
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed room name to "${value}"`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      socket.emit('error', 'Changement was failed', e.message);
    }
  });

  socket.on('change_mapWidth', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing map width to' + value);
        room.mapWidth = value;
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the map width to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_mapHeight', async (value) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing map height to' + value);
        room.mapHeight = value;
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the map height to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
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
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the mountain to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
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
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the city to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
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
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the swamp to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('change_maxPlayers', async (value) => {
    try {
      if (player.isRoomHost) {
        if (value <= 1) {
          socket.emit('error', 'Changement was failed', 'Max player num is invalid.');
          return;
        }
        console.log('Changing max players to' + value);
        room.maxPlayers = value;
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('room_message', player, `changed the max player num to ${value}.`);
      } else {
        socket.emit('error', 'Changement was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('player_message', async (message) => {
    io.in(room.id).emit('room_message', player, ': ' + message);
  });

  socket.on('disconnect', async () => {
    await handleDisconnectInRoom(room, player, io);
    socket.disconnect();
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
      io.in(room.id).emit('update_room', room);

      if (room.forceStartNum >= forceStartOK[room.players.length]) {
        await handleGame(room, io);
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('attack', async (from: Point, to: Point, isHalf: boolean) => {
    let playerIndex = await getPlayerIndexBySocket(room, socket.id);
    if (playerIndex !== -1) {
      let player = room.players[playerIndex];
      if (room.map && player.operatedTurn < room.map.turn && room.map.commandable(player, from, to)) {
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
});
