import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";
import ChatBox from "@/components/chatbox";

interface Room {
  name: string;
  gameMode: string;
  playersNum: number;
  botsNum: number;
  status: string;
}

function generateRandomString(length: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

function Lobby() {
  const router = useRouter();
  const rooms: Room[] = [
    { name: 'Room 1', gameMode: 'FFA', playersNum: 2, botsNum: 0, status: 'Waiting' },
    { name: 'Room 2', gameMode: '1v1', playersNum: 4, botsNum: 2, status: 'In Progress' },
    { name: 'Room 3', gameMode: 'custom', playersNum: 6, botsNum: 4, status: 'Waiting' }
  ];

  const handleRoomClick = (roomName: string) => {
    router.push(`/room/${roomName}`);
  };

  const handleCreateRoomClick = async () => {
    let success = false;
    for (let i = 0; i < 3; i++) {
      let random_roomid = generateRandomString(7);
      const res = await fetch(`/api/rooms/${random_roomid}`); // TODO
      if (res.status === 404) {
        success = true;
        router.push(`/room/${random_roomid}`);
        break;
        }
      }
    if (!success) {
      alert('Failed to create room. Please try again later.');
    }
  };
    
    
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-white mb-8">Lobby</h1>
        <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Room Name
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Game Mode
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Players
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Bots
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Status
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Join
                </th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.name} className="hover:bg-gray-700">
                  <td
                    className="py-4 px-6 text-white font-medium cursor-pointer"
                    onClick={() => handleRoomClick(room.name)}
                  >
                    {room.name}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    {room.gameMode}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    {room.playersNum}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    {room.botsNum}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    <span
                      className={classNames("text-sm font-medium", {
                        "text-green-600": room.status === "open",
                        "text-red-600": room.status === "closed",
                      })}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
                      onClick={() => handleRoomClick(room.name)}
                    >
                      Join
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="my-5">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg" onClick={handleCreateRoomClick}>
              Create Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;