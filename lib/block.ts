// import Player from "@/lib/Player";
// 循环引用..

class Block {
  x: number;
  y: number;
  type: string;
  unit: number;
  player?: any;

  constructor(x: number, y: number, type: string) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.unit = 0;
    this.player = null;
  }

  setUnit(unit: number): void {
    this.unit = unit;
  }

  setType(type: string): void {
    this.type = type;
  }

  kingBeDominated(): void {
    this.type = 'c'; // City
  }

  beDominated(player: any, unit: number): void {
    this.unit = unit - this.unit;
    this.player = player;
    this.player.winLand(this);
  }

  initKing(player: any): void {
    this.type = 'k'; // King
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

  getView(): { type: string; unit: number; player: any } {
    return {
      type: this.type,
      unit: this.unit,
      player: this.player,
    };
  }
  beNeutralized(): void {
    this.type = 'n'; // Neutral todo 中立之后 type 应该是什么?
    this.player = null;
  }
}

export default Block;
