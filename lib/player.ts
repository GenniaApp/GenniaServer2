import Block from './block';

class Player {
  constructor(
    public id: string,
    public socket_id: string,
    public username: string,
    public color: number, // see lib/colors
    public isRoomHost: boolean = false,
    public forceStart: boolean = false, // if ready
    public isDead: boolean = false,
    public operatedTurn: number = 0,
    public land: Block[] = [],
    public king?: Block,
  ) { }
  toJSON() {
    const { land, king, ...json } = this;
    return json;
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
