import { Server } from 'socket.io';
import GameMap from '@/lib/map'
import Point from '@/lib/point'
import Player from '@/lib/player'
import genniaserver from '../../package.json'
import xss from 'xss'
import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next';

const speedArr: number[] = [0.25, 0.5, 0.75, 1, 2, 3, 4];
const forceStartOK: number[] = [1, 2, 2, 3, 3, 4, 5, 5, 6];
//                    0  1  2  3  4  5  6  7  8

interface serverConfigProp {
  name: string;
  port: number;
};

const serverConfig: serverConfigProp = {
  name: "GenniaServer",
  port: 8080,
}


interface Room {
  id: string,
  username: string;
  gameStarted: boolean;
  map: GameMap | undefined;
  gameLoop: any;
  gameConfig: {
    maxPlayers: number;
    gameSpeed: number;
    mapWidth: number;
    mapHeight: number;
    mountain: number;
    city: number;
    swamp: number;
  };
  players: Player[];
  generals: Point[];
  forceStartNum: number;
  mapGenerated: boolean;
}

const gamerooms: { [key: string]: Room } = {};

function leaveRoom(roomId: string) {
  delete gamerooms[roomId];
}

function createRoom(roomId: string) {
  gamerooms[roomId] = {
    id: roomId,
    username: "",
    gameStarted: false,
    map: undefined,
    gameLoop: undefined,
    gameConfig: {
      maxPlayers: 8,
      gameSpeed: 3,
      mapWidth: 0.75,
      mapHeight: 0.75,
      mountain: 0.5,
      city: 0.5,
      swamp: 0,
    },
    players: new Array<Player>(),
    generals: new Array<Point>(),
    forceStartNum: 0,
    mapGenerated: false,
  };
}

async function handleDisconnectInGame(room: Room, player: Player, io: Server) {
  try {
    io.in(room.id).emit("room_message", player.trans(), "quit.");
    room.players = room.players.filter((p) => p.id != player.id);
  } catch (e: any) {
    console.log(e.message);
  }
}

async function handleDisconnectInRoom(room: Room, player: Player, io: Server) {
  try {
    io.in(room.id).emit("room_message", player.trans(), "quit.");
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
    io.in(room.id).emit("force_start_changed", room.forceStartNum);
    room.players = newPlayers;
    if (room.players.length > 0) room.players[0].setRoomHost(true);
    io.in(room.id).emit(
      "players_changed",
      room.players.map((player) => player.trans())
    );
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
        socket.emit("game_started", room.players[playerIndex].color);
      }
    }
    room.gameStarted = true;

    room.map = new GameMap(
      room.gameConfig.mapWidth,
      room.gameConfig.mapHeight,
      room.gameConfig.mountain,
      room.gameConfig.city,
      room.gameConfig.swamp,
      room.players
    );
    room.players = await room.map.generate();
    room.mapGenerated = true;

    io.in(room.id).emit("init_game_map", room.map.width, room.map.height);

    for (let [id, socket] of io.sockets.sockets) {
      socket.on("attack", async (from, to, isHalf) => {
        let playerIndex = await getPlayerIndexBySocket(room, id);
        if (playerIndex !== -1) {
          let player = room.players[playerIndex];
          if (room.map &&
            player.operatedTurn < room.map.turn &&
            room.map.commandable(player, from, to)
          ) {
            if (isHalf) {
              room.map.moveHalfMovableUnit(player, from, to);
            } else {
              room.map.moveAllMovableUnit(player, from, to);
            }

            room.players[playerIndex].operatedTurn = room.map.turn;
            socket.emit("attack_success", from, to);
          } else {
            socket.emit("attack_failure", from, to);
          }
        }
      });
    }

    let updTime = 500 / speedArr[room.gameConfig.gameSpeed];
    room.gameLoop = setInterval(async () => {
      try {
        room.players.forEach(async (player) => {
          let block = room.map.getBlock(player.king);

          let blockPlayerIndex = await getPlayerIndex(room, block.player.id);
          if (blockPlayerIndex !== -1) {
            if (block.player !== player && player.isDead === false) {
              console.log(block.player.username, "captured", player.username);
              io.in(room.id).emit("captured", block.player.trans(), player.trans());
              io.sockets.sockets
                .get(player.socket_id)
                .emit("game_over", block.player.trans());
              player.isDead = true;
              room.map.getBlock(player.king).kingBeDominated();
              player.land.forEach((block) => {
                room.map.transferBlock(
                  block,
                  room.players[blockPlayerIndex]
                );
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
          io.in(room.id).emit("game_ended", alivePlayer.id);
          room.gameStarted = false;
          room.forceStartNum = 0;
          console.log("Game ended");
          clearInterval(room.gameLoop);
        }

        let leaderBoard = room.players
          .map((player) => {
            let data = room.map.getTotal(player);
            return {
              color: player.color,
              username: player.username,
              army: data.army,
              land: data.land,
            };
          })
          .sort((a, b) => {
            return b.army - a.army || b.land - a.land;
          });

        for (let [id, socket] of io.sockets.sockets) {
          let playerIndex = await getPlayerIndexBySocket(room, id);
          if (playerIndex !== -1) {
            let view = await room.map.getViewPlayer(
              room.players[playerIndex]
            );
            view = JSON.stringify(view);
            socket.emit(
              "game_update",
              view,
              room.map.width,
              room.map.height,
              room.map.turn,
              leaderBoard
            );
          }
        }
        room.map.updateTurn();
        room.map.updateUnit();
      } catch (e) {
        console.log(e);
      }
    }, updTime);
  }
}



function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log('*First use, starting socket.io');

    const io = new Server((res.socket as any).server);

    io.on("connection", async (socket) => {

      const { roomId, name, picture } = socket.handshake.query;
      console.log(`Socket ${socket.id} has connected to room ${roomId} named ${name} picture ${picture}`)

      if (!gamerooms[roomId as string]) { createRoom(roomId as string); }

      let room = gamerooms[roomId as string];

      if (room.players.length >= room.gameConfig.maxPlayers)
        socket.emit("reject_join", "The room is full.");
      else {
        socket.on("query_server_info", async () => {
          socket.emit(
            "server_info",
            serverConfig.name,
            genniaserver.version,
            room.gameStarted,
            room.players.length,
            room.forceStartNum,
            room.gameConfig.maxPlayers
          );
        });
      }

      let player: Player;

      socket.on("reconnect", async (playerId) => {
        try {
          if (room.gameStarted) {
            // Allow to reconnect
            let playerIndex = await getPlayerIndex(room, playerId);
            if (playerIndex !== -1) {
              player = room.players[playerIndex];
              room.players[playerIndex].socket_id = socket.id;
              io.in(room.id).emit(
                "room_message",
                player.trans(),
                "re-joined the lobby."
              );
            }
          }
        } catch (e) {
          socket.emit(
            "error",
            "An unknown error occurred: " + e.message,
            e.stack
          );
        }
      });

      socket.on("set_username", async (username) => {
        try {
          username = xss(username);
          if (!username.length) {
            socket.emit("reject_join", "Username is invalid");
            return;
          }
          if (room.gameStarted) {
            socket.emit("reject_join", "Game is already started");
            return;
          }
          // This socket will be first called when the player connects the server
          let playerId = crypto
            .randomBytes(Math.ceil(10 / 2))
            .toString("hex")
            .slice(0, 10);
          console.log("Player:", username, "playerId:", playerId);
          socket.emit("set_player_id", playerId);

          player = new Player(
            playerId,
            socket.id,
            username,
            room.players.length
          );

          room.players.push(player);
          let playerIndex = room.players.length - 1;

          io.in(room.id).emit("room_message", player.trans(), "joined the lobby.");
          io.in(room.id).emit(
            "players_changed",
            room.players.map((player) => player.trans())
          );

          if (room.players.length === 1) {
            console.log(room.players[playerIndex]);
            room.players[playerIndex].setRoomHost(true);
          }
          room.players[playerIndex].username = username;
          io.in(room.id).emit(
            "players_changed",
            room.players.map((player) => player.trans())
          );

          // Only emit to this player so it will get the latest status
          socket.emit("force_start_changed", room.forceStartNum);

          if (room.players.length >= room.gameConfig.maxPlayers) {
            await handleGame(room, io);
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("get_game_settings", async () => {
        socket.emit("push_game_settings", room.gameConfig);
      });

      socket.on("change_host", async (userId) => {
        try {
          if (player.isRoomHost) {
            let currentHost = await getPlayerIndex(room, player.id);
            let newHost = await getPlayerIndex(room, userId);
            if (newHost !== -1) {
              room.players[currentHost].setRoomHost(false);
              room.players[newHost].setRoomHost(true);
              io.in(room.id).emit(
                "players_changed",
                room.players.map((player) => player.trans())
              );
            }
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_game_speed", async (value) => {
        try {
          if (player.isRoomHost) {
            console.log("Changing game speed to " + speedArr[value] + "x");
            room.gameConfig.gameSpeed = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the game speed to ${speedArr[value]}x.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_map_width", async (value) => {
        try {
          if (player.isRoomHost) {
            console.log("Changing map width to" + value);
            room.gameConfig.mapWidth = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the map width to ${value}.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_map_height", async (value) => {
        try {
          if (player.isRoomHost) {
            console.log("Changing map height to" + value);
            room.gameConfig.mapHeight = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the map height to ${value}.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_mountain", async (value) => {
        try {
          if (player.isRoomHost) {
            console.log("Changing mountain to" + value);
            room.gameConfig.mountain = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the mountain to ${value}.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_city", async (value) => {
        try {
          if (player.isRoomHost) {
            console.log("Changing city to" + value);
            room.gameConfig.city = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the city to ${value}.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_swamp", async (value) => {
        try {
          if (player.isRoomHost) {
            console.log("Changing swamp to" + value);
            room.gameConfig.swamp = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the swamp to ${value}.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("change_max_player_num", async (value) => {
        try {
          if (player.isRoomHost) {
            if (value <= 1) {
              socket.emit(
                "error",
                "Changement was failed",
                "Max player num is invalid."
              );
              return;
            }
            console.log("Changing max players to" + value);
            room.gameConfig.maxPlayers = value;
            io.in(room.id).emit("game_config_changed", room.gameConfig);
            io.in(room.id).emit(
              "room_message",
              player.trans(),
              `changed the max player num to ${value}.`
            );
          } else {
            socket.emit(
              "error",
              "Changement was failed",
              "You are not the game host."
            );
          }
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("player_message", async (message) => {
        io.in(room.id).emit("room_message", player.trans(), ": " + message);
      });

      socket.on("disconnect", async () => {
        if (!room.gameStarted) await handleDisconnectInRoom(room, player, io);
        else await handleDisconnectInGame(room, player, io);
      });

      socket.on("leave_game", async () => {
        try {
          socket.disconnect();
          await handleDisconnectInGame(room, player, io);
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("force_start", async () => {
        try {
          let playerIndex = await getPlayerIndex(room, player.id);
          if (room.players[playerIndex].forceStart === true) {
            room.players[playerIndex].forceStart = false;
            --room.forceStartNum;
          } else {
            room.players[playerIndex].forceStart = true;
            ++room.forceStartNum;
          }
          io.in(room.id).emit(
            "players_changed",
            room.players.map((player) => player.trans())
          );
          io.in(room.id).emit("force_start_changed", room.forceStartNum);

          if (room.forceStartNum >= forceStartOK[room.players.length]) {
            await handleGame(room, io);
          }
        } catch (e) {
          console.log(e.message);
        }
      });
    });
  } else {
    console.log('socket.io already running');
  }
  res.end();

};

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler;
