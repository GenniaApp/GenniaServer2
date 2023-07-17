// import Player from "@/lib/Player";
// 循环引用..
import { TileType, TileProp, Point } from './types';

class Block extends Point {
  constructor(
    public x: number,
    public y: number,
    public type: TileType,
    public unit: number = 0,
    public player: any = null,
    public isRevealed: boolean = false,
  ) {
    super(x, y);
  }

  setUnit(unit: number): void {
    this.unit = unit;
  }

  setType(type: TileType): void {
    this.type = type;
  }

  kingBeDominated(): void {
    this.type = TileType.City;
  }

  beDominated(player: any, unit: number): void {
    this.unit = unit - this.unit;
    this.player = player;
    this.player.winLand(this);
  }

  initKing(player: any): void {
    this.type = TileType.King;
    this.unit = 1;
    this.player = player;
  }

  enterUnit(player: any, unit: number): void {
    if (this.player === player) {
      this.unit += unit;
    } else {
      if (this.unit >= unit) {
        this.unit -= unit;
      } else if (this.unit < unit) {
        this.beDominated(player, unit);
      }
    }
  }

  leaveUnit(unit: number): void {
    this.unit -= unit;
  }

  getMovableUnit(): number {
    return Math.max(this.unit - 1, 0);
  }

  getView(): TileProp {
    return [this.type, this.player ? this.player.color : null, this.unit];
  }

  beNeutralized(): void {
    this.player = null;
  }
}

export default Block;
