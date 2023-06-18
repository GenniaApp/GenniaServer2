import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import MessageCenter from "@/components/messageCenter";
import GameSetting from "@/components/gameSetting";
import PlayerView from "@/components/playerView";
import Swal from "sweetalert2";

interface Player {
  name: string;
  color: string;
  ready: boolean;
}

export default function GameBoard() {
  const [gameMap, setGameMap] = useState([]);
  const [selectedTd, setSelectedTd] = useState(null);
  const [queue, setQueue] = useState([]);
  const [serverInfo, setServerInfo] = useState({ name: "", version: "" });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [mapWidth, setMapWidth] = useState(50);
  const [mapHeight, setMapHeight] = useState(50);
  const [mountain, setMountain] = useState(0);
  const [city, setCity] = useState(0);
  const [swamp, setSwamp] = useState(0);
  const [maxPlayerNum, setMaxPlayerNum] = useState(4);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("players");

  const socketRef = useRef<any>();

  const router = useRouter();
  const { roomId } = router.query; // as string
  const user = { name: "testName", picture: "tmp.png", playerId: "testId" };

  const players_example = [
    { name: "Player 1", color: "bg-red-500", ready: true },
    { name: "Player 2", color: "bg-blue-500", ready: false },
    { name: "Player 3", color: "bg-green-500", ready: true },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleMessageChange = (event: any) => {
    // setMessage(event.target.value);
    setMessage(event.currentTarget.value);
  };

  const reJoinGame = () => {
    router.push(`/`);
  };

  const handleSendMessage = (event: any) => {
    if (message.length != 0) {
      setMessages([...messages, message]);
      setMessage("");
    }
  };
  useEffect(() => {
    if (!roomId) return;
    fetch("/api/gserver").finally(() => {
      socketRef.current = io({
        query: { roomId: roomId, name: user.name, picture: user.picture },
      });

      let socket = socketRef.current;

      socket.on("connect", () => {
        console.log(`socket client connect to server: ${socket.id}`);
      });

      socket.on("server_info", (name, version) => {
        console.log(`server_info: ${name} ${version}`);
        setServerInfo({ name, version });
      });

      socket.on("game_update", (gameMap, width, height, turn, leaderBoard) => {
        // Update game map state
        setGameMap(JSON.parse(gameMap));
        console.log(gameMap);
        console.log(`width ${width}`);
        console.log(`height ${height}`);
        console.log(`leaderBoard ${leaderBoard}`);
      });

      socket.on("reject_join", (title, message) => {
        Swal.fire({
          title: title,
          text: message,
          icon: "error",
          showDenyButton: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "OK",
        }).then((result) => {
          // return to home or lobby
          reJoinGame();
        });
      });

      socket.on("connect_error", (error) => {
        console.log("\nConnection Failed: " + error);
        // $("#submitGameJoin").attr("class", "ui disabled fluid red button");
        // $("#submitGameJoin").text("Game Join Failed.");
        socket.emit("leave_game");
        socket.close();
      });

      socket.on("disconnect", () => {
        // if (!window.leaved_game) {
        Swal.fire({
          title: "Disconnected from the server",
          html: "Please reflush the App.",
          icon: "error",
          showDenyButton: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "Quit",
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          reJoinGame();
        });
        console.log("Disconnected from server.");
        // }
      });

      socket.on("reconnect", () => {
        console.log("Reconnected to server.");
        if (gameStarted) {
          socket.emit("reconnect", user.playerId);
        } else {
          socket.emit("set_username", user.name);
          socket.emit("get_game_settings");
        }
      });

      socket.emit("query_server_info");
      socket.emit("set_username", user.name);
      console.log("send query server info");

      return () => {
        socket.disconnect();
      };
    });
  }, [roomId]);

  function handleKeyDown(event) {
    const withinMap = (point) => {
      // Check if point is within game map boundaries
      return (
        point.x >= 0 &&
        point.x < gameMap.length &&
        point.y >= 0 &&
        point.y < gameMap[0].length
      );
    };

    const handleMove = (direction) => {
      let newPoint;
      if (direction === "left") {
        newPoint = { x: selectedTd.x, y: selectedTd.y - 1 };
      } else if (direction === "up") {
        newPoint = { x: selectedTd.x - 1, y: selectedTd.y };
      } else if (direction === "right") {
        newPoint = { x: selectedTd.x, y: selectedTd.y + 1 };
      } else if (direction === "down") {
        newPoint = { x: selectedTd.x + 1, y: selectedTd.y };
      }

      if (withinMap(newPoint)) {
        setQueue([
          ...queue,
          {
            from: selectedTd,
            to: newPoint,
            half: selectedTd.half,
          },
        ]);
        setSelectedTd(newPoint);
      }
    };

    switch (event.which) {
      case 65: // Left
      case 37:
        handleMove("left");
        break;
      case 87: // Up
      case 38:
        handleMove("up");
        break;
      case 68: // Right
      case 39:
        handleMove("right");
        break;
      case 83: // Down
      case 40:
        handleMove("down");
        break;
      default:
        break;
    }
  }

  function handleAttackFailure(from, to) {
    setQueue((prevQueue) => {
      // Remove last item from queue
      const newQueue = [...prevQueue];
      newQueue.pop();

      // Remove any items in queue that have the same 'to' point as the failed attack
      let lastPoint = to;
      while (newQueue.length > 0) {
        const point = newQueue[newQueue.length - 1].from;
        if (point.x === lastPoint.x && point.y === lastPoint.y) {
          newQueue.pop();
          lastPoint = point;
        } else {
          break;
        }
      }

      return newQueue;
    });
  }

  function handleSelectTd(point) {
    setSelectedTd(point);
  }

  return (
    // todo: set page title
    <div className="flex flex-col h-screen">
      <text className="text-white">
        {serverInfo.name} Version: {serverInfo.version}{" "}
      </text>
      <div className="flex-1">
        <div className="flex justify-center items-center h-full">
          <div className="w-full max-w-3xl">
            {gameStarted ? (
              <table>
                {gameMap.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={`${i}-${j}`}
                        className={`reqblock color${
                          cell.color
                        } ${cell.type.toLowerCase()} ${
                          selectedTd && selectedTd.x === i && selectedTd.y === j
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleSelectTd({ x: i, y: j })}
                        // onClick={handleAttack}
                      >
                        {cell.unit}
                      </td>
                    ))}
                  </tr>
                ))}
              </table>
            ) : (
              <div className="bg-white shadow-lg px-4 py-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xl font-bold text-gray-700">
                    Game Room
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div
                    className={` bg-gray-300 cursor-pointer text-xl font-bold rounded-t-lg ${
                      activeTab === "players"
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                    onClick={() => handleTabChange("players")}
                  >
                    Players
                  </div>
                  <div
                    className={` bg-gray-300 cursor-pointer text-xl font-bold rounded-t-lg ${
                      activeTab === "settings"
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                    onClick={() => handleTabChange("settings")}
                  >
                    Game Settings
                  </div>
                </div>
                {activeTab === "players" && (
                  <PlayerView maxPlayerNum={maxPlayerNum} />
                )}
                {activeTab === "settings" && (
                  <GameSetting
                    gameSpeed={gameSpeed}
                    setGameSpeed={setGameSpeed}
                    mapWidth={mapWidth}
                    setMapWidth={setMapWidth}
                    mapHeight={mapHeight}
                    setMapHeight={setMapHeight}
                    mountain={mountain}
                    setMountain={setMountain}
                    city={city}
                    setCity={setCity}
                    swamp={swamp}
                    setSwamp={setSwamp}
                    maxPlayerNum={maxPlayerNum}
                    setMaxPlayerNum={setMaxPlayerNum}
                  />
                )}
              </div>
            )}
            <MessageCenter
              message={message}
              messages={messages}
              handleMessageChange={handleMessageChange}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
