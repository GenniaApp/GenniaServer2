import { LeaderBoardTable, MapDiffData, Message } from './types';

interface GameRecordPerTurn {
  turn: number;
  mapDiffData: MapDiffData | null;
  leaderBoardData: LeaderBoardTable | null;
}

class GameRecord {
  gameRecord: Array<GameRecordPerTurn> = [];
  messagesRecord: Array<Message> | null;

  constructor() { }

  addGameUpdate(mapDiffData: MapDiffData, turn: number, leaderBoardData: LeaderBoardTable): void {
    this.gameRecord.push({ mapDiffData, turn, leaderBoardData });
  }

  addMessage(message: Message): void {
    this.messagesRecord.push(message)
  }
}

export default GameRecord;
