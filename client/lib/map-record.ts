import Block from './block';
import { TileProp, TilesProp, MapDiffData } from './types';

class MapDiff {
  data: MapDiffData = [];
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
}

class MapRecord {
  prevMap: TilesProp | null = null;
  diffArr: Array<MapDiff> = [];

  constructor() { }

  patch(data: Block[][]): Promise<MapDiff> {
    let diff: MapDiff = new MapDiff();
    let curMap = data.flat().map((b) => b.getView());
    if (!this.prevMap) {
      diff.data = curMap;
    } else {
      for (let i = 0; i < curMap.length; ++i) {
        if (JSON.stringify(this.prevMap[i]) === JSON.stringify(curMap[i])) {
          diff.addSame();
        } else {
          diff.endSame();
          diff.addDiff(curMap[i]);
        }
      }
      diff.endSame();
    }
    this.prevMap = curMap;
    this.diffArr.push(diff);
    return new Promise((resolve) => resolve(diff));
  }
}

export { MapRecord, MapDiff };