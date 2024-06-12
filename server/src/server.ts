import express, { Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import xss from 'xss';
import crypto from 'crypto';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Prisma, PrismaClient } from '@prisma/client';

import { ColorArr, MaxTeamNum, forceStartOK } from './lib/constants';
import { roomPool, createRoom } from './lib/room-pool';
import { Room, initGameInfo, CustomMapData, MapDiffData, LeaderBoardTable, LeaderBoardRow } from './lib/types';
import { getPlayerIndex, getPlayerIndexBySocket } from './lib/utils';
import Point from './lib/point';
import Player from './lib/player';
import GameMap from './lib/map';
import MapDiff from './lib/map-diff';
import GameRecord from './lib/game-record';

if (!process.env.CLIENT_URL || !process.env.PORT) {
  throw new Error('Please fill in `CLIENT_URL` and `PORT`.');
}

const prisma = new PrismaClient();
const app = express();
const cors_urls = process.env.CLIENT_URL == '*' ? '*' : process.env.CLIENT_URL.split(' ');
console.log(cors_urls);

app.use(express.json());
app.use(cors({ origin: cors_urls }));

app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json('');
});

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

app.get('/get_replay/:replayId', async (req: Request, res: Response) => {
  const replayId = req.params.replayId;
  const replayFilePath = path.join(process.cwd(), 'records', `${replayId}.json`);

  fs.readFile(replayFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).json({ error: 'Replay not found' });
    } else {
      try {
        const replayData = JSON.parse(data);
        res.status(200).json(replayData);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to parse replay data' });
      }
    }
  });
});

app.get('/maps', async (req, res) => {
  const maps = await prisma.customMapData.findMany({
    select: {
      id: true,
      name: true,
      width: true,
      height: true,
      creator: true,
      description: true,
      createdAt: true,
      views: true,
      starCount: true,
    },
  });
  res.json(maps);
});

app.post('/maps', async (req, res) => {
  try {
    await prisma.customMapData.create({
      data: {
        ...req.body,
        mapTilesData: JSON.stringify(req.body.mapTilesData),
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

app.get('/maps/:id', async (req, res) => {
  const map = await prisma.customMapData.findUnique({
    where: { id: req.params.id },
  });
  if (!map) return res.status(404).end(); // Not Found
  await prisma.customMapData.update({
    where: { id: req.params.id },
    data: {
      views: {
        increment: 1,
      },
    },
  });
  map.mapTilesData = JSON.parse(map.mapTilesData);
  res.json(map);
});

app.put('/maps/:id', async (req, res) => {
  const updatedMap = await prisma.customMapData.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      mapTilesData: JSON.stringify(req.body.mapTilesData),
    },
  });
  res.json(updatedMap);
});

app.delete('/maps/:id', async (req, res) => {
  const deletedMap = await prisma.customMapData.delete({
    where: { id: req.params.id },
  });
  res.json(deletedMap);
});

app.get('/new', async (req, res) => {
  const newestMaps = await prisma.customMapData.findMany({
    orderBy: { createdAt: 'desc' },
    take: 25,
    select: {
      id: true,
      name: true,
      width: true,
      height: true,
      creator: true,
      description: true,
      createdAt: true,
      views: true,
      starCount: true,
    },
  });
  res.json(newestMaps);
});

app.get('/best', async (req, res) => {
  const bestMaps = await prisma.customMapData.findMany({
    orderBy: { starCount: 'desc' },
    take: 25,
    select: {
      id: true,
      name: true,
      width: true,
      height: true,
      creator: true,
      description: true,
      createdAt: true,
      views: true,
      starCount: true,
    },
  });
  res.json(bestMaps);
});

app.get('/hot', async (req, res) => {
  const hotMaps = await prisma.customMapData.findMany({
    orderBy: { views: 'desc' },
    take: 25,
    select: {
      id: true,
      name: true,
      width: true,
      height: true,
      creator: true,
      description: true,
      createdAt: true,
      views: true,
      starCount: true,
    },
  });
  res.json(hotMaps);
});

app.get('/search', async (req: Request, res: Response) => {
  const searchTerm = req.query.q;

  if (typeof searchTerm !== 'string') {
    res.status(400).json({ error: 'Invalid query parameter' });
    return;
  }

  const searchedMaps = await prisma.customMapData.findMany({
    where: {
      OR: [{ name: { contains: searchTerm } }, { id: { equals: searchTerm } }],
    },
    select: {
      id: true,
      name: true,
      width: true,
      height: true,
      creator: true,
      description: true,
      createdAt: true,
      views: true,
      starCount: true,
    },
  });
  res.json(searchedMaps);
});

app.post('/toggleStar', async (req: Request, res: Response) => {
  const { userId, mapId, action } = req.body;

  if (action !== 'increase' && action !== 'decrease') {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }

  const existingStar = await prisma.starUsers.findUnique({
    where: { userId_mapId: { userId, mapId } },
  });

  if (action === 'increase') {
    if (existingStar) {
      res.status(400).json({ error: 'You have already starred this map' });
      return;
    }

    await prisma.$transaction([
      prisma.starUsers.create({ data: { userId, mapId } }),
      prisma.customMapData.update({ where: { id: mapId }, data: { starCount: { increment: 1 } } }),
    ]);
  } else {
    if (!existingStar) {
      res.status(400).json({ error: 'You have not starred this map yet' });
      return;
    }

    await prisma.$transaction([
      prisma.starUsers.delete({ where: { userId_mapId: { userId, mapId } } }),
      prisma.customMapData.update({ where: { id: mapId }, data: { starCount: { decrement: 1 } } }),
    ]);
  }

  res.json({ success: true });
});

app.get('/starredMaps', async (req, res) => {
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const starredMaps = await prisma.starUsers.findMany({
    where: { userId },
    select: { mapId: true },
  });

  res.json(starredMaps.map((starUsers) => starUsers.mapId));
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Application started on port ${process.env.PORT}!`);
});

const io = new Server(server, {
  cors: {
    origin: cors_urls,
  },
});

function handleNeutralized(room: Room, player: Player) {
  if (player.king) {
    room.map.getBlock(player.king).kingBeDominated();
  } else {
    console.log('Error! king is null', player);
  }
  // 变成中立单元: todo 延迟一段时间再变为中立单元更合理
  player.land.forEach((block) => {
    block.beNeutralized();
  });
  player.land.length = 0;
  player.king = null;
  player.isDead = true;
}

async function handleDisconnectInRoom(room: Room, player: Player, io: Server) {
  try {
    io.in(room.id).emit('room_message', player, 'quit.');
    if (room.gameStarted && !player.spectating()) {
      player.disconnected = true;
      handleNeutralized(room, player);
    } else {
      room.players = room.players.filter((p) => p.id != player.id);
    }

    room.forceStartNum = 0;
    for (let i = 0, c = 0; i < room.players.length; ++i) {
      if (room.players[i].forceStart) {
        ++room.forceStartNum;
      }
    }
    if (room.players.length < 1 && !room.keepAlive) {
      delete roomPool[room.id];
    } else {
      if (room.players[0]) room.players[0].setRoomHost(true);
    }
    io.in(room.id).emit('update_room', room);
  } catch (e: any) {
    console.error(JSON.stringify(e, ['message', 'arguments', 'type', 'name']));
    console.log(e.stack);
  }
}

async function checkForcedStart(room: Room, io: Server) {
  let forceStartNum = forceStartOK[room.players.filter((player) => !player.spectating()).length];

  if (!room.gameStarted && room.forceStartNum >= forceStartNum) {
    await handleGame(room, io);
  }
}

async function handleGame(room: Room, io: Server) {
  if (room.gameStarted === false) {
    room.players.forEach((player) => {
      player.reset();
    });

    if (room.mapId) {
      const data = await prisma.customMapData.findUnique({
        where: { id: room.mapId },
      });
      if (!data) {
        throw new Error('Map not found');
      }
      console.log(`Start game with custom map ${room.mapId} ${data.name}`);

      const customMapData = {
        ...data,
        mapTilesData: JSON.parse(data.mapTilesData),
      };
      room.map = GameMap.from_custom_map(customMapData, room.players, room.revealKing);
    } else {
      let actualWidth = Math.ceil(Math.sqrt(room.players.length) * 5 + 12 * room.mapWidth);
      let actualHeight = Math.ceil(Math.sqrt(room.players.length) * 5 + 12 * room.mapHeight);
      room.map = new GameMap(
        'random_map_id',
        'random_map_name',
        actualWidth,
        actualHeight,
        room.mountain,
        room.city,
        room.swamp,
        room.players,
        room.revealKing
      );
      room.map.generate();

      console.log(`Start game with random map `);
    }
    room.mapGenerated = true;
    room.globalMapDiff = new MapDiff();
    room.gameRecord = new GameRecord(room.players, room.map.width, room.map.height);

    // Now: Client can get map name / width / height !
    // todo 对于自定义地图，地图名称应该在游戏开始前获知，而不是开始时
    console.info(`Start game`);
    room.gameStarted = true;
    let intro_message = 'Chat is being recorded. 欢迎加入游戏 QQ 群: 374889821';
    room.gameRecord.addMessage({ turn: room.map.turn, player: null, content: intro_message });
    io.in(room.id).emit('update_room', room);
    io.in(room.id).emit('room_message', null, intro_message);
    room.players.forEach((player) => {
      let player_socket = io.sockets.sockets.get(player.socket_id);
      if (player_socket) {
        let initGameInfo: initGameInfo = {
          king: player.king ? { x: player.king.x, y: player.king.y } : { x: 0, y: 0 }, // spectator's king is null
          mapWidth: room.map.width,
          mapHeight: room.map.height,
        };
        player_socket.emit('game_started', initGameInfo);
        player.patchView = new MapDiff();
      }
    });

    let updTime = 500 / room.gameSpeed;
    room.gameLoop = setInterval(async () => {
      try {
        room.players.forEach((player) => {
          if (!room.map) throw new Error('king is null');
          if (!player.isDead && !player.spectating() && !player.disconnected) {
            let block = room.map.getBlock(player.king);
            let blockPlayerIndex = getPlayerIndex(room, block.player?.id);
            if (blockPlayerIndex !== -1) {
              if (block.player !== player && player.isDead === false) {
                console.log(block.player.username, 'captured', player.username);
                io.in(room.id).emit('captured', block.player.minify(), player.minify());
                let player_socket = io.sockets.sockets.get(player.socket_id);
                if (player_socket) {
                  player_socket.emit('game_over', block.player.minify()); // captured by block.player
                } else {
                  throw new Error('socket is null');
                }
                player.isDead = true;
                player.land.forEach((block) => {
                  room.map.transferBlock(block, room.players[blockPlayerIndex]);
                  room.players[blockPlayerIndex].winLand(block);
                });
                room.map.getBlock(player.king).kingBeDominated();
                player.land.length = 0;
              } else if (player.operatedTurn === 0 && player.operatedTurn + 160 <= room.map.turn) {
                // if player is not operated for 160/2 turns, it will be neutralized
                handleNeutralized(room, player);
                io.in(room.id).emit('room_message', player.minify(), 'surrendered');
              }
            }
          }
        });

        let leaderBoardData: LeaderBoardTable = room.players
          .filter((player) => !player.spectating())
          .map((player) => {
            let data = room.map.getTotal(player);
            return [player.color, player.team, data.army, data.land] as LeaderBoardRow;
          });

        let room_sockets = await io.in(room.id).fetchSockets();

        for (let socket of room_sockets) {
          let playerIndex = getPlayerIndexBySocket(room, socket.id);
          if (playerIndex !== -1 && room.players[playerIndex].patchView && !room.players[playerIndex].disconnected) {
            if (
              (room.deathSpectator && room.players[playerIndex].isDead) ||
              !room.fogOfWar ||
              room.players[playerIndex].spectating()
            ) {
              await room.players[playerIndex].patchView.patch(room.map.map);
            } else {
              await room.players[playerIndex].patchView.patch(await room.map.getViewPlayer(room.players[playerIndex]));
            }
            socket.emit('game_update', room.players[playerIndex].patchView.data, room.map.turn, leaderBoardData);
          }
        }

        await room.globalMapDiff.patch(room.map.map);
        room.gameRecord.addGameUpdate(room.globalMapDiff.data, room.map.turn, leaderBoardData);
        room.map.updateTurn();
        room.map.updateUnit();

        let aliveTeams = [];
        for (let player of room.players) {
          if (!player.isDead && !player.spectating() && !aliveTeams.includes(player.team)) {
            aliveTeams.push(player.team);
          }
        }
        // Game over, Find Winner
        if (aliveTeams.length <= 1) {
          if (!aliveTeams.length) return;
          let link = room.gameRecord.outPutToJSON(process.cwd());
          io.in(room.id).emit(
            'game_ended',
            room.players.filter((x) => x.team === aliveTeams[0]).map((x) => x.minify(true)),
            link
          ); // winner
          console.log('Game ended, replay link: ', link);

          room.gameStarted = false;
          room.forceStartNum = 0;
          io.in(room.id).emit('update_room', room);

          room.players.forEach((player) => {
            player.reset();
          });

          room.players = room.players.filter((p) => !p.disconnected);
          clearInterval(room.gameLoop);
        }
      } catch (e: any) {
        console.error(JSON.stringify(e, ['message', 'arguments', 'type', 'name']));
        console.log(e.stack);
      }
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
  if (!roomId) {
    reject_join(socket, `roomId: ${username} is invalid`);
    return;
  }
  username = xss(username);
  if (!username.length) {
    username = 'Anonymous';
  }
  if (!roomPool[roomId]) {
    try {
      await createRoom(roomId);
    } catch (e: any) {
      reject_join(socket, e.message);
      console.error(JSON.stringify(e, ['message', 'arguments', 'type', 'name']));
      console.log(e.stack);
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

  let isValidReconnectPlayer = false;

  if (myPlayerId) {
    // reconnect or same user with multiple tabs
    // todo: unfinished 因为玩家 disconnect 后，对应的 id会被清空，需要区分正常退出（清除id）和异常退出（保留玩家id）的情况
    let playerIndex = getPlayerIndex(room, myPlayerId);

    if (playerIndex !== -1) {
      isValidReconnectPlayer = true;
      room.players = room.players.filter((p) => p !== player);
      player = room.players[playerIndex];
      player.disconnected = false;
      room.players[playerIndex].socket_id = socket.id;
      io.in(room.id).emit('room_message', player.minify(), 're-joined the lobby.');
      io.in(room.id).emit('update_room', room);
    }
  }

  if (!isValidReconnectPlayer) {
    let playerId = crypto
      .randomBytes(Math.ceil(10 / 2))
      .toString('hex')
      .slice(0, 10);

    let allColor = Array.from({ length: ColorArr.length }, (_, i) => i);
    let occupiedColor = room.players.map((player) => player.color);
    occupiedColor.push(0); // 0 is reserved for neutral block
    let availableColor = allColor.filter((color) => {
      return !occupiedColor.includes(color);
    });
    let playerColor = availableColor[0];

    let allTeam = Array.from({ length: MaxTeamNum }, (_, i) => i + 1);
    let occupiedTeam = room.players.map((player) => player.team);
    let availableTeam = allTeam.filter((team) => {
      return !occupiedTeam.includes(team);
    });
    let playerTeam = availableTeam[0];

    player = new Player(playerId, socket.id, username, playerColor, playerTeam);
    console.log(`Connect! Socket ${socket.id}, room ${roomId} name ${username} playerId ${playerId} color ${playerColor}`);

    if (room.players.length === 0) {
      player.setRoomHost(true);
    }

    socket.emit('set_player_id', player.id);

    let message = 'joined the room.';

    if (room.gameStarted) {
      player.setSpectate();
      let initGameInfo: initGameInfo = {
        king: { x: 0, y: 0 }, // spectator's king is null
        mapWidth: room.map.width,
        mapHeight: room.map.height,
      };
      socket.emit('game_started', initGameInfo);
      player.patchView = new MapDiff();
      message = 'joined as spectator.';
    }

    room.players.push(player);

    // broadcast new player message to room
    io.in(room.id).emit('room_message', player.minify(), message);
    io.in(room.id).emit('update_room', room);
    console.log(player.username, message);

    // if (room.players.length >= room.maxPlayers) {
    //   await handleGame(room, io);
    // }
  }

  // ====================================
  // set up socket event listeners
  // ====================================

  socket.on('get_room_info', async () => {
    socket.emit('update_room', room);
  });

  socket.on('set_team', async (team) => {
    if ((team as number) <= 0 || (team as number) > MaxTeamNum + 1) {
      socket.emit('error', 'Unable to change team', `Team must be between 1 and ${MaxTeamNum} or spectators`);
      return;
    }
    player.team = team as number;

    if (player.spectating()) {
      // set spectate will cancel force start
      let playerIndex = getPlayerIndex(room, player.id);
      if (room.players[playerIndex].forceStart === true) {
        room.players[playerIndex].forceStart = false;
        --room.forceStartNum;
      }
    }
    io.in(room.id).emit('update_room', room);
    io.in(room.id).emit('room_message', player.minify(), player.spectating() ? 'became a spectator.' : `change to team ${team}.`);
    checkForcedStart(room, io);
  });

  socket.on('surrender', async (playerId) => {
    let playerIndex = getPlayerIndex(room, playerId);
    if (playerIndex === -1) {
      socket.emit('error', 'Surrender failed', 'Player not found.');
      return;
    }
    player = room.players[playerIndex];

    console.log(`${player.username} surrendered.`);

    if (!room.map) {
      socket.emit('error', 'Surrender failed', 'Map not found.');
      console.log('Error! Map not found.');
      return;
    }

    await handleNeutralized(room, player);

    io.in(room.id).emit('room_message', player.minify(), 'surrendered');
  });

  socket.on('change_host', async (playerId) => {
    try {
      if (!player.isRoomHost) {
        throw new Error('You are not the room host.');
      }
      let currentHost = getPlayerIndex(room, player.id);
      let newHost = getPlayerIndex(room, playerId);
      if (newHost !== -1) {
        room.players[currentHost].setRoomHost(false);
        room.players[newHost].setRoomHost(true);
        io.in(room.id).emit('update_room', room);
        io.in(room.id).emit('host_modification', player.minify(), room.players[newHost]);
      } else {
        throw new Error('Target player not found.');
      }
    } catch (e: any) {
      socket.emit('error', 'Host modification failed', e.message);
    }
  });

  socket.on('change_room_setting', async (property: string, value: number | string | boolean) => {
    try {
      if (player.isRoomHost) {
        console.log('Changing Room Setting ', property, value);
        if (property in room && value !== undefined) {
          // todo: move validation to Room class
          switch (property) {
            case 'roomName':
              if (typeof value !== 'string' || value.length > 20) {
                socket.emit('error', 'Modification was failed', 'Room name is too long.');
                return;
              }
              break;
            case 'mapId':
              if (typeof value !== 'string' || value.length > 50) {
                socket.emit('error', 'Modification was failed', 'invalid MapId');
                return;
              }
              const map = await prisma.customMapData.findUnique({
                where: { id: value },
                select: { name: true },
              });
              room.mapName = map?.name || '';
              break;
            case 'maxPlayers':
              if (typeof value !== 'number' || value <= 1) {
                socket.emit('error', 'Modification was failed', 'Max player num is invalid.');
                return;
              }
              break;
            case 'gameSpeed':
              if (typeof value !== 'number' || ![0.5, 0.75, 1, 2, 3, 4].includes(value)) {
                socket.emit('error', 'Modification was failed', `Game speed: ${value} is invalid. typeof value ${typeof value}}`);
                return;
              }
              break;
            case 'mapWidth':
            case 'mapHeight':
            case 'mountain':
            case 'city':
            case 'swamp':
              if (typeof value !== 'number' || value < 0 || value > 1) {
                socket.emit('error', 'Modification was failed', `Map ${property} is invalid.`);
                return;
              }
              break;
            case 'fogOfWar':
            case 'revealKing':
            case 'warringStatesMode':
            case 'deathSpectator':
              if (typeof value !== 'boolean') {
                socket.emit('error', 'Modification was failed', 'Invalid value.');
                return;
              }
              break;
            default:
              break;
          }

          room[property] = value;
          io.in(room.id).emit('update_room', room);
          if (property === 'mapId') {
            io.in(room.id).emit('room_message', player.minify(), `changed mapName to ${room.mapName}.`);
          } else {
            io.in(room.id).emit('room_message', player.minify(), `changed ${property} to ${value}.`);
          }
        } else {
          socket.emit('error', 'Modification was failed', `Invalid property: ${property} or value: ${value}.`);
        }
      } else {
        socket.emit('error', 'Modification was failed', 'You are not the game host.');
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });

  socket.on('player_message', async (message) => {
    if (room.gameStarted) {
      room.gameRecord.addMessage({ turn: room.map.turn, player: player.minify(), content: message });
    }
    io.in(room.id).emit('room_message', player.minify(), ': ' + message);
  });

  socket.on('disconnect', async () => {
    await handleDisconnectInRoom(room, player, io);
    socket.disconnect();
    checkForcedStart(room, io); // check if game can start
  });

  socket.on('force_start', async () => {
    try {
      let playerIndex = getPlayerIndex(room, player.id);
      if (!room.players[playerIndex].spectating()) {
        if (room.players[playerIndex].forceStart === true) {
          room.players[playerIndex].forceStart = false;
          --room.forceStartNum;
        } else {
          room.players[playerIndex].forceStart = true;
          ++room.forceStartNum;
        }
        io.in(room.id).emit('update_room', room);
      }

      checkForcedStart(room, io);
    } catch (e: any) {
      console.log(e.stack);
      console.error(JSON.stringify(e, ['message', 'arguments', 'type', 'name']));
    }
  });

  socket.on('attack', async (from: Point, to: Point, isHalf: boolean) => {
    try {
      if (typeof isHalf !== 'boolean') {
        socket.emit('attack_failure', from, to, 'Invalid parameter type');
        return;
      }
      if (from.x < 0 || from.x >= room.map.width || from.y < 0 || from.y >= room.map.height) {
        socket.emit('attack_failure', from, to, 'Invalid starting point');
        return;
      }

      if (to.x < 0 || to.x >= room.map.width || to.y < 0 || to.y >= room.map.height) {
        socket.emit('attack_failure', from, to, 'Invalid ending point, out of map');
        return;
      }

      if (Math.abs(from.x - to.x) > 1 || Math.abs(from.y - to.y) > 1) {
        socket.emit('attack_failure', from, to, 'Invalid ending point, not adjacent');
        return;
      }

      let playerIndex = getPlayerIndexBySocket(room, socket.id);
      if (playerIndex !== -1) {
        let player = room.players[playerIndex];
        if (room.map && player.operatedTurn < room.map.turn && room.map.commendable(player, from, to)) {
          if (isHalf) {
            room.map.moveHalfMovableUnit(player, from, to);
          } else {
            room.map.moveAllMovableUnit(player, from, to);
          }

          room.players[playerIndex].operatedTurn = room.map.turn;
          socket.emit('attack_success', from, to, room.map.turn);
        } else {
          socket.emit(
            'attack_failure',
            from,
            to,
            `Invalid operation: ${player.operatedTurn} ${room.map.turn} ${room.map.commendable(player, from, to)}`
          );
        }
      }
    } catch (e: any) {
      console.log(e.stack);
      console.error(JSON.stringify(e, ['message', 'arguments', 'type', 'name']));
    }
  });
});
