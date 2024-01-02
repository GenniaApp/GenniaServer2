import { LeaderBoardTable, MapDiffData, Message, Player, GameRecordPerTurn } from './types';
import { writeFileSync } from 'fs';
import path from 'path';


class GameRecord {
  public gameRecordTurns: Array<GameRecordPerTurn> = [];
  public messagesRecord: Array<Message> = [];

  constructor(
    public players: Player[],
    public mapWidth: number,
    public mapHeight: number,
  ) { }

  addGameUpdate(
    data: MapDiffData,
    turn: number,
    lead: LeaderBoardTable
  ): void {
    this.gameRecordTurns.push({ data, turn, lead });
  }

  addMessage(message: Message): void {
    this.messagesRecord.push(message);
  }

  outPutToJSON(dirname: string): string {
    let filename = Math.random().toString(36).slice(-8);

    if (!require('fs').existsSync(path.join(dirname, 'records'))) {
      require('fs').mkdirSync(path.join(dirname, 'records'));
    }

    writeFileSync(
      path.join(dirname, 'records', `${filename}.json`),
      JSON.stringify(this)
    );
    return filename;
  }
}

export default GameRecord;
