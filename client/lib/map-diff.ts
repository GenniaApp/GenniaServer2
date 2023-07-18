import Block from './block';
import { TileProp, TilesProp, MapDiffData } from './types';

class MapDiff {
  data: MapDiffData = [];
  prevMap: TilesProp | null = null;
  curSameCnt: number = 0;
  curDiffArr: TilesProp = [];

  constructor() { }

  addSame(): void {
    ++this.curSameCnt;
  }

  addDiff(block: TileProp): void {
    this.data.push(block);
  }

  endSame(): void {
    if (this.curSameCnt > 0) {
      this.data.push(this.curSameCnt);
      this.curSameCnt = 0;
    }
  }

  patch(blockMap: Block[][]): Promise<void> {
    let curMap = blockMap.flat().map((b) => b.getView());
    if (!this.prevMap) {
      this.data = curMap;
    } else {
      this.data = [];
      for (let i = 0; i < curMap.length; ++i) {
        if (JSON.stringify(this.prevMap[i]) === JSON.stringify(curMap[i])) {
          this.addSame();
        } else {
          this.endSame();
          this.addDiff(curMap[i]);
        }
      }
      this.endSame();
    }
    this.prevMap = curMap;
    return new Promise((resolve) => {resolve()});
  }
}

export default MapDiff;