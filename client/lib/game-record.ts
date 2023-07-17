import Block from './block';
import { MapDiff, TileProp, TilesProp, MapDiffData, LeaderBoardData, Message } from './types';

interface GameRecordPerTurn {
  mapDiff?: MapDiff | null;
  leaderBoardData?: LeaderBoardData | null;
  messages?: Array<Message> | null;
}

class GameRecord {
  gameRecord: Array<GameRecordPerTurn> = [];

  constructor() {}

  addMapDiff(mapDiff: MapDiff): void {
    if (this.gameRecord[this.gameRecord.length - 1].mapDiff) {
      this.gameRecord.push({ mapDiff });
    } else {
      this.gameRecord[this.gameRecord.length - 1].mapDiff = mapDiff;
    }
  }

  addLeaderBoardData(leaderBoardData: LeaderBoardData): void {
    if (this.gameRecord[this.gameRecord.length - 1].leaderBoardData) {
      this.gameRecord.push({ leaderBoardData });
    } else {
      this.gameRecord[this.gameRecord.length - 1].leaderBoardData = leaderBoardData;
    }
  }

  addMessage(message: Message): void {
    let messages = this.gameRecord[this.gameRecord.length - 1].messages;
    if (messages
      && messages.length
      && messages[messages.length - 1].turn === message.turn) {
      this.gameRecord[this.gameRecord.length - 1].messages.push(message);
    } else {
      this.gameRecord.push({ messages: [message] });
    }
  }
}

export default GameRecord;
