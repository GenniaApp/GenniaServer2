import { Server } from 'socket.io';
import GameMap from '@/lib/map'
import Player from '@/lib/player'
import genniaserver from '../../package.json'
import xss from 'xss'
import crypto from 'crypto'
// import type { NextApiRequest, NextApiResponse } from 'next';

const speedArr = [0.25, 0.5, 0.75, 1, 2, 3, 4];
const forceStartOK = [1, 2, 2, 3, 3, 4, 5, 5, 6];
//                    0  1  2  3  4  5  6  7  8
//                    

const serverConfig = {
  name: "GenniaServer",
  port: 8080,
}


let global = {
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
  players: new Array(),
  generals: new Array(),
  forceStartNum: 0,
};


async function handleDisconnectInGame(player, io) {
  try {
    io.local.emit("room_message", player.trans(), "quit.");
    global.players = global.players.filter((p) => p.id != player.id);
  } catch (e) {
    console.log(e.message);
  }
}

async function handleDisconnectInRoom(player, io) {
  try {
    io.local.emit("room_message", player.trans(), "quit.");
    let newPlayers = [];
    global.forceStartNum = 0;
    for (let i = 0, c = 0; i < global.players.length; ++i) {
      if (global.players[i].id !== player.id) {
        global.players[i].color = c++;
        newPlayers.push(global.players[i]);
        if (global.players[i].forceStart) {
          ++global.forceStartNum;
        }
      }
    }
    io.local.emit("force_start_changed", global.forceStartNum);
    global.players = newPlayers;
    if (global.players.length > 0) global.players[0].setRoomHost(true);
    io.local.emit(
      "players_changed",
      global.players.map((player) => player.trans())
    );
  } catch (e) {
    console.log(e.message);
  }
}

async function getPlayerIndex(playerId) {
  for (let i = 0; i < global.players.length; ++i) {
    if (global.players[i].id === playerId) {
      return i;
    }
  }
  return -1;
}

async function getPlayerIndexBySocket(socketId) {
  for (let i = 0; i < global.players.length; ++i) {
    if (global.players[i].socket_id === socketId) {
      return i;
    }
  }
  return -1;
}

async function handleGame(io) {
  if (global.gameStarted === false) {
    console.info(`Start game`);
    for (let [id, socket] of io.sockets.sockets) {
      let playerIndex = await getPlayerIndexBySocket(id);
      if (playerIndex !== -1) {
        socket.emit("game_started", global.players[playerIndex].color);
      }
    }
    global.gameStarted = true;

    global.map = new GameMap(
      global.gameConfig.mapWidth,
      global.gameConfig.mapHeight,
      global.gameConfig.mountain,
      global.gameConfig.city,
      global.gameConfig.swamp,
      global.players
    );
    global.players = await global.map.generate();
    global.mapGenerated = true;

    io.local.emit("init_game_map", global.map.width, global.map.height);

    for (let [id, socket] of io.sockets.sockets) {
      socket.on("attack", async (from, to, isHalf) => {
        let playerIndex = await getPlayerIndexBySocket(id);
        if (playerIndex !== -1) {
          let player = global.players[playerIndex];
          if (
            player.operatedTurn < global.map.turn &&
            global.map.commandable(player, from, to)
          ) {
            if (isHalf) {
              global.map.moveHalfMovableUnit(player, from, to);
            } else {
              global.map.moveAllMovableUnit(player, from, to);
            }

            global.players[playerIndex].operatedTurn = global.map.turn;
            socket.emit("attack_success", from, to);
          } else {
            socket.emit("attack_failure", from, to);
          }
        }
      });
    }

    let updTime = 500 / speedArr[global.gameConfig.gameSpeed];
    global.gameLoop = setInterval(async () => {
      try {
        global.players.forEach(async (player) => {
          let block = global.map.getBlock(player.king);

          let blockPlayerIndex = await getPlayerIndex(block.player.id);
          if (blockPlayerIndex !== -1) {
            if (block.player !== player && player.isDead === false) {
              console.log(block.player.username, "captured", player.username);
              io.local.emit("captured", block.player.trans(), player.trans());
              io.sockets.sockets
                .get(player.socket_id)
                .emit("game_over", block.player.trans());
              player.isDead = true;
              global.map.getBlock(player.king).kingBeDominated();
              player.land.forEach((block) => {
                global.map.transferBlock(
                  block,
                  global.players[blockPlayerIndex]
                );
                global.players[blockPlayerIndex].winLand(block);
              });
              player.land.length = 0;
            }
          }
        });
        let alivePlayer = null,
          countAlive = 0;
        for (let a of global.players)
          if (!a.isDead) (alivePlayer = a), ++countAlive;
        if (countAlive === 1) {
          io.local.emit("game_ended", alivePlayer.id);
          global.gameStarted = false;
          global.forceStartNum = 0;
          console.log("Game ended");
          clearInterval(global.gameLoop);
        }

        let leaderBoard = global.players
          .map((player) => {
            let data = global.map.getTotal(player);
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
          let playerIndex = await getPlayerIndexBySocket(id);
          if (playerIndex !== -1) {
            let view = await global.map.getViewPlayer(
              global.players[playerIndex]
            );
            view = JSON.stringify(view);
            socket.emit(
              "game_update",
              view,
              global.map.width,
              global.map.height,
              global.turn,
              leaderBoard
            );
          }
        }
        global.map.updateTurn();
        global.map.updateUnit();
      } catch (e) {
        console.log(e);
      }
    }, updTime);
  }
}



// function ioHandler(req: NextApiRequest, res: NextApiResponse) {
function ioHandler(req, res) {
  // if (!(res.socket as any).server.io) {
  if (!(res.socket).server.io) {
    console.log('*First use, starting socket.io');

    // const io = new Server((res.socket as any).server);
    const io = new Server((res.socket).server);


    io.on("connection", async (socket) => {

      const { roomId, name, picture } = socket.handshake.query;
      console.log(`Socket ${socket.id} has connected to room ${roomId} named ${name} picture ${picture}`)

      if (global.players.length >= global.gameConfig.maxPlayers)
        socket.emit("reject_join", "The room is full.");
      else {
        socket.on("query_server_info", async () => {
          socket.emit(
            "server_info",
            serverConfig.name,
            genniaserver.version,
            global.gameStarted,
            global.players.length,
            global.forceStartNum,
            global.gameConfig.maxPlayers
          );
        });

        let player;

        socket.on("reconnect", async (playerId) => {
          try {
            if (global.gameStarted) {
              // Allow to reconnect
              let playerIndex = await getPlayerIndex(playerId);
              if (playerIndex !== -1) {
                player = global.players[playerIndex];
                global.players[playerIndex].socket_id = socket.id;
                io.local.emit(
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
            if (global.gameStarted) {
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
              global.players.length
            );

            global.players.push(player);
            let playerIndex = global.players.length - 1;

            io.local.emit("room_message", player.trans(), "joined the lobby.");
            io.local.emit(
              "players_changed",
              global.players.map((player) => player.trans())
            );

            if (global.players.length === 1) {
              console.log(global.players[playerIndex]);
              global.players[playerIndex].setRoomHost(true);
            }
            global.players[playerIndex].username = username;
            io.local.emit(
              "players_changed",
              global.players.map((player) => player.trans())
            );

            // Only emit to this player so it will get the latest status
            socket.emit("force_start_changed", global.forceStartNum);

            if (global.players.length >= global.gameConfig.maxPlayers) {
              await handleGame(io);
            }
          } catch (e) {
            console.log(e.message);
          }
        });

        socket.on("get_game_settings", async () => {
          socket.emit("push_game_settings", global.gameConfig);
        });

        socket.on("change_host", async (userId) => {
          try {
            if (player.isRoomHost) {
              let currentHost = await getPlayerIndex(player.id);
              let newHost = await getPlayerIndex(userId);
              if (newHost !== -1) {
                global.players[currentHost].setRoomHost(false);
                global.players[newHost].setRoomHost(true);
                io.local.emit(
                  "players_changed",
                  global.players.map((player) => player.trans())
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
              global.gameConfig.gameSpeed = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
              global.gameConfig.mapWidth = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
              global.gameConfig.mapHeight = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
              global.gameConfig.mountain = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
              global.gameConfig.city = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
              global.gameConfig.swamp = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
              global.gameConfig.maxPlayers = value;
              io.local.emit("game_config_changed", global.gameConfig);
              io.local.emit(
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
          io.local.emit("room_message", player.trans(), ": " + message);
        });

        socket.on("disconnect", async () => {
          if (!global.gameStarted) await handleDisconnectInRoom(player, io);
          else await handleDisconnectInGame(player, io);
        });

        socket.on("leave_game", async () => {
          try {
            socket.disconnect();
            await handleDisconnectInGame(player, io);
          } catch (e) {
            console.log(e.message);
          }
        });

        socket.on("force_start", async () => {
          try {
            let playerIndex = await getPlayerIndex(player.id);
            if (global.players[playerIndex].forceStart === true) {
              global.players[playerIndex].forceStart = false;
              --global.forceStartNum;
            } else {
              global.players[playerIndex].forceStart = true;
              ++global.forceStartNum;
            }
            io.local.emit(
              "players_changed",
              global.players.map((player) => player.trans())
            );
            io.local.emit("force_start_changed", global.forceStartNum);

            if (global.forceStartNum >= forceStartOK[global.players.length]) {
              await handleGame(io);
            }
          } catch (e) {
            console.log(e.message);
          }
        });
      }
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
