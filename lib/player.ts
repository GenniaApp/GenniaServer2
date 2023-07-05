import Block from './block';

class Player {
  id: string;
  socket_id: string;
  username: string;
  color: number; // see colors.ts
  isRoomHost: boolean = false;
  forceStart: boolean = false; // if ready
  isDead: boolean = false;
  operatedTurn: number = 0;
  land: Block[] = [];
  king?: Block;

  constructor(id: string, socket_id: string, username: string, color: number) {
    this.id = id;
    this.socket_id = socket_id;
    this.username = username;
    this.color = color;
  }

  trans(): any {
    return {
      id: this.id,
      socket_id: this.socket_id,
      username: this.username,
      color: this.color,
      isRoomHost: this.isRoomHost,
      forceStart: this.forceStart,
      isDead: this.isDead,
      operatedTurn: this.operatedTurn,
    };
  }

  setRoomHost(value: boolean): void {
    this.isRoomHost = value;
  }

  initKing(block: Block): void {
    this.king = block;
    this.winLand(block);
  }

  getNumberOfLand(): number {
    return this.land.length;
  }

  winLand(block: Block): void {
    this.land.push(block);
    block.player = this;
  }

  loseLand(block: Block): void {
    const pos = this.land.indexOf(block);
    if (pos !== -1) {
      this.land.splice(pos, 1);
    }
  }

  getTotalUnit(): number {
    const reducer = (value: number, land: Block) => value + land.unit;
    return this.land.reduce(reducer, 0);
  }

  beDominated(): void {
    if (!this.king) {
      throw new Error('King is not initialized');
    }
    this.king.setType('City');
    this.land.forEach((block) => {
      this.king && this.king.player.winLand(block);
    });
  }

  beNeutralized(): void {
    this.land.forEach((block) => {
      block.beNeutralized();
    });
  }
}

export default Player;
