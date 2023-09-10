import { Room, RoomPool } from './types';

export const roomPool: RoomPool = {};

const MAX_ROOM_COUNT = 15;
var roomCount = 0;

export async function createRoom(
  roomId: string = '',
  roomName: string = 'Untitled'
) {
  try {
    if (Object.keys(roomPool).length > MAX_ROOM_COUNT)
      throw new Error('Room count exceeded');
    if (!roomId) {
      ++roomCount;
      roomId = String(roomCount + 1);
    }
    let newRoom = new Room(roomId, roomName);
    roomPool[roomId] = newRoom;
    return {
      success: true,
      roomId: roomId,
    };
  } catch (e: any) {
    console.error(JSON.stringify(e, ["message", "arguments", "type", "name"]));
    return {
      success: false,
      message: e.message,
    };
  }
}

// Bot
roomPool['1'] = Room.create({
  id: '1',
  roomName: '机器人Bot Room',
  keepAlive: true,
});

// Warring state
roomPool['warring_state'] = Room.create({
  id: 'warring_state',
  roomName: '战国模式 Warring State',
  warringStatesMode: true,
  revealKing: true,
  keepAlive: true,
});

// mobile
// roomPool['mobile'] = Room.create({
//   id: 'mobile',
//   roomName: '手机房 Mobile Room',
//   mapWidth: 0.9,
//   mapHeight: 0.4,
//   keepAlive: true,
// });