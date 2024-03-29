import Block from './block';
import MapDiff from './map-diff';
import { UserData, TileType } from './types';
import { MaxTeamNum } from './constants';

class Player {
  constructor(
    public id: string,
    public socket_id: string,
    public username: string,
    public color: number, // see lib/colors
    public team: number,
    public isRoomHost: boolean = false,
    public forceStart: boolean = false, // if ready
    public isDead: boolean = false,
    public operatedTurn: number = 0,
    public land: Block[] = [],
    public king: Block | null = null,
    public patchView: MapDiff | null = null,
    // when player disconnect, don't delete to keep game data
    // clear disconnect player when game ended
    public disconnected: boolean = false,
  ) { }

  setSpectate(): void { this.team = MaxTeamNum + 1; }
  spectating(): boolean { return this.team === MaxTeamNum + 1; }

  minify(withId?: boolean): UserData {
    return withId
      ? { id: this.id, username: this.username, color: this.color }
      : { username: this.username, color: this.color };
  }

  toJSON() {
    const { land, king, patchView, ...json } = this;
    return json;
  }

  reset(): void {
    this.forceStart = false;
    this.isDead = false;
    this.operatedTurn = 0;
    this.land = [];
    this.king = null;
    this.patchView = null;
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
    this.king.setType(TileType.City);
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
