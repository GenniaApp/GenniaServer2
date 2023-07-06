import { Room, RoomPool } from '@/lib/types';

export const roomPool: RoomPool = {};

const MAX_ROOM_COUNT = 15;
const MAX_ROOM_NAME_LENGTH = 10;
var roomCount = 0;

createRoom('Test Room 1');

export async function leaveRoom(roomId: string) {
  try {
    delete roomPool[roomId];
  } catch (_) {}
}

export async function createRoom(roomName: string) {
  try {
    if (roomCount > MAX_ROOM_COUNT) throw new Error('Room count exceeded');
    if (roomName.length > 0 && roomName.length < MAX_ROOM_NAME_LENGTH)
      throw new Error('Room name is invalid, length must be between 0 and 10');
    ++roomCount;
    roomPool[String(roomCount)] = new Room(String(roomCount), roomName);
    return {
      success: true,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      reason: err.message,
    };
  }
}
