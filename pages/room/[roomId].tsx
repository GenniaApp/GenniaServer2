import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import ChatBox from "@/components/chatbox";
import io from "socket.io-client";
import Link from "next/link";

const socket = io();

interface Player {
  name: string;
  color: string;
  ready: boolean;
}

interface GameConfig {
  gameMode: "FFA" | "1v1" | "custom";
  playersNum: number;
  botsNum: number;
}

const players_example = [
    { name: "Player 1", color: "bg-red-500", ready: true },
    { name: "Player 2", color: "bg-blue-500", ready: false },
    { name: "Player 3", color: "bg-green-500", ready: true },
]

export default function GameRoom() {

  const router = useRouter();
  const { roomId }= router.query; // as string

  // const [roomId, setRoomId] = useState("");
//   const [players, setPlayers] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>(players_example);
  const [shareLink, setShareLink] = useState("");
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    gameMode: "FFA",
    playersNum: 6,
    botsNum: 2,
  });

  useEffect(() => {
    setShareLink(window.location.href);
  },[]);



  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log(`Connected to server with ID ${socket.id}`);
  //     const query = window.location.search;
  //     const roomId = new URLSearchParams(query).get("roomId");
  //     if (roomId) {
  //       // setRoomId(roomId);
  //       socket.emit("join_room", roomId);
  //     }
  //   });

  //   socket.on("player_list", (players: Player[]) => {
  //     setPlayers(players);
  //   });

  //   socket.on("game_config", (config: GameConfig) => {
  //     setGameConfig(config);
  //   });

  //   socket.on("disconnect", () => {
  //     console.log(`Disconnected from server with ID ${socket.id}`);
  //   });
  // }, []);

  const handleReady = () => {
    socket.emit("ready");
  };

  const handleGameConfigChange = (key: keyof GameConfig, value: string) => {
    setGameConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const handleGameConfigSubmit = () => {
    socket.emit("game_config", gameConfig);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Room: {roomId}</h1>
          <span className="text-gray-400 text-lg" >{shareLink}</span>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg" onClick={handleCopyLink}>
            Copy Link
          </button>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <h2 className="text-lg font-bold text-white mb-2">Players</h2>
            <ul className="bg-gray-700 rounded-lg p-4">
              {players.map((player) => (
                <li
                  key={player.name}
                  className="flex items-center justify-between mb-2"
                >
                  <div className={`w-4 h-4 rounded-full mr-4 ${player.color}`} />
                  <span className="text-white flex-1">{player.name}</span>
                  {player.ready ? (
                    <span className="text-green-500 font-medium">Ready</span>
                  ) : (
                    <span className="text-red-500 font-medium">Not Ready</span>
                  )}
                </li>
              ))}
            </ul>
            {/* <Link
              href="/lobby"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mt-4 "
            >
              Back to Home
            </Link> */}
            <button
              onClick={handleReady}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mt-4 "
            >
              Ready to Play
            </button>
          </div>
          <div className="w-1/2">
            <h2 className="text-lg font-bold text-white mb-2">Game Settings</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="game-mode" className="text-white font-medium">
                  Game Mode
                </label>
                <select
                  id="game-mode"
                  value={gameConfig.gameMode}
                  onChange={(e) =>
                    handleGameConfigChange("gameMode", e.target.value)
                  }
                  className="bg-gray-800 rounded-lg py-2 px-4 text-white"
                >
                  <option value="FFA">FFA</option>
                  <option value="1v1">1v1</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="players-num" className="text-white font-medium">
                  Number of Players
                </label>
                <input
                  id="players-num"
                  type="number"
                  value={gameConfig.playersNum}
                  onChange={(e) =>
                    handleGameConfigChange("playersNum", e.target.value)
                  }
                  className="bg-gray-800 rounded-lg py-2 px-4 text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="bots-num" className="text-white font-medium">
                  Number of Bots
                </label>
                <input
                  id="bots-num"
                  type="number"
                  value={gameConfig.botsNum}
                  onChange={(e) =>
                    handleGameConfigChange("botsNum", e.target.value)
                  }
                  className="bg-gray-800 rounded-lg py-2 px-4 text-white"
                />
              </div>
              <button
                onClick={handleGameConfigSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mt-4"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
        <ChatBox roomid={roomId} />
      </div>
    </div>
  );
}
