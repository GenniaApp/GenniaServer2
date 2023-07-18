import { UserData, LeaderBoardTable, MapDiffData, Message } from './types';
import { writeFileSync } from 'fs';
import path from 'path';

interface GameRecordPerTurn {
  turn: number;
  mapDiffData: MapDiffData | null;
  leaderBoardData: LeaderBoardTable | null;
}

class GameRecord {
  gameRecord: Array<GameRecordPerTurn> = [];
  messagesRecord: Array<Message> = [];

  constructor(public players: Array<UserData>) {
    this.players = players;
  }

  addGameUpdate(
    mapDiffData: MapDiffData,
    turn: number,
    leaderBoardData: LeaderBoardTable
  ): void {
    this.gameRecord.push({ mapDiffData, turn, leaderBoardData });
  }

  addMessage(message: Message): void {
    this.messagesRecord.push(message);
  }

  outPutToJSON(dirname: string): string {
    let filename = Math.random().toString(36).slice(-8);
    let data = {
      players: this.players,
      gameRecord: this.gameRecord,
      messagesRecord: this.messagesRecord,
    };
    writeFileSync(
      path.join(dirname, 'records', `${filename}.json`),
      JSON.stringify(data)
    );
    return filename;
  }
}

export default GameRecord;
