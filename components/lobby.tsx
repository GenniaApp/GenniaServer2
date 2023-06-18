import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import ChatBox from "@/components/chatbox";
import { RoomInfo } from "@/lib/types";

function generateRandomString(length: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const router = useRouter();
  // const rooms: RoomInfo[] = [
  //   { id: 'Room1', mapId: 'random_map', players: 2, maxPlayers: 0, gameStarted: true, gameSpeed: 2},
  // ];

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch("/api/rooms");
      console.log(res);
      const rooms = await res.json();
      console.log(rooms);
      setRooms(rooms.room_info);
    };
    setInterval(fetchRooms, 2000);
  }, []);

  const handleRoomClick = (roomId: string) => {
    router.push(`/game/${roomId}`);
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
      alert("Failed to create room. Please try again later.");
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
                  Room Id
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Map Id
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Game Speed
                </th>
                <th className="text-left text-gray-400 py-4 px-6 uppercase font-medium text-sm">
                  Players
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
              {rooms &&
                rooms.length > 0 &&
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-700">
                    <td
                      className="py-4 px-6 text-white font-medium cursor-pointer"
                      onClick={() => handleRoomClick(room.id)}
                    >
                      {room.id}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">
                      {room.mapId}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">
                      {room.gameSpeed}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">
                      {`${room.players}/${room.maxPlayers}`}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">
                      <span
                        className={classNames(
                          "text-sm font-medium",
                          room.gameStarted ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {room.gameStarted ? "Started" : "Waiting"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
                        onClick={() => handleRoomClick(room.id)}
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
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
            onClick={handleCreateRoomClick}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
