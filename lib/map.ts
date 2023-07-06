import Block from '@/lib/block';
import Point from '@/lib/point';
import Player from '@/lib/player';

const directions = [
  new Point(-1, -1),
  new Point(0, -1),
  new Point(1, -1),
  new Point(-1, 0),
  new Point(0, 0),
  new Point(1, 0),
  new Point(-1, 1),
  new Point(0, 1),
  new Point(1, 1),
];

function calcDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getRandomInt(min: number, max: number): number {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt)) + minInt;
}

class GameMap {
  map: Block[][];
  turn: number;

  constructor(
    public id: string,
    public name: string,
    public width: number,
    public height: number,
    public mountain: number,
    public city: number,
    public swamp: number,
    public kings: Player[]
  ) {
    this.width = Math.sqrt(kings.length) * 5 + 6 * width;
    this.height = Math.sqrt(kings.length) * 5 + 6 * height;
    if (mountain + city === 0) {
      this.mountain = this.city = 0;
    } else {
      this.mountain =
        (((this.width * this.height) / 4) * mountain) / (mountain + city);
      this.city = (((this.width * this.height) / 6) * city) / (mountain + city);
      console.log('mountains', this.mountain, 'cities', this.city);
    }
    this.swamp =
      ((this.width * this.height - this.mountain - this.city) / 3) * swamp;
    this.kings = kings;
    this.map = Array.from(Array(this.width), () =>
      Array(this.height).fill(null)
    );
    this.turn = 0;
  }

  getFather(conn: number[], curPoint: number): number {
    while (conn[curPoint] !== curPoint) {
      conn[curPoint] = conn[conn[curPoint]];
      curPoint = conn[curPoint];
    }
    return curPoint;
  }

  isObstacle(block: Block): boolean {
    return block.type === 'Mountain' || block.type === 'City';
  }

  isPlain(block: Block): boolean {
    return block.type === 'Plain';
  }

  checkConnection(obstacleCount: number) {
    const conn = new Array(this.width * this.height)
      .fill(null)
      .map((_, i) => i);
    const size = new Array(this.width * this.height).fill(1);
    let connected = false;

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        if (!this.isObstacle(this.map[i][j])) {
          const curPoint = i * this.height + j;
          const neighbors = [
            { x: i - 1, y: j },
            { x: i, y: j - 1 },
          ];
          for (const neighbor of neighbors) {
            const { x, y } = neighbor;
            if (
              this.withinMap(new Point(x, y)) &&
              !this.isObstacle(this.map[x][y])
            ) {
              const lastPoint = x * this.height + y;
              const curFather = this.getFather(conn, curPoint);
              const lastFather = this.getFather(conn, lastPoint);
              if (curFather !== lastFather) {
                if (size[lastFather] > size[curFather]) {
                  conn[curFather] = lastFather;
                  size[lastFather] += size[curFather];
                } else {
                  conn[lastFather] = curFather;
                  size[curFather] += size[lastFather];
                }
              }
            }
          }
        }
        if (
          size[this.getFather(conn, i * this.height + j)] >=
          this.width * this.height - obstacleCount
        ) {
          connected = true;
          break;
        }
      }
      if (connected) {
        break;
      }
    }

    return connected;
  }

  generate(): Promise<Player[]> {
    console.log('Width:', this.width, 'Height:', this.height);
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.map[i][j] = new Block(i, j, 'Plain');
      }
    }
    // Generate the king
    for (let i = 0; i < this.kings.length; ++i) {
      let pos = null;
      while (true) {
        let x = getRandomInt(0, this.width);
        let y = getRandomInt(0, this.height);
        pos = new Point(x, y);
        let block = this.getBlock(pos);
        if (block.type !== 'King') {
          let flag = true;
          for (let j = 0; j < i; ++j)
            if (calcDistance(this.kings[j].king, new Point(x, y)) <= 6) {
              flag = false;
              break;
            }
          if (flag) {
            block.initKing(this.kings[i]);
            this.kings[i].initKing(block);
            break;
          }
        }
      }
    }
    console.log('Kings generated successfully');
    // Generate the mountain
    for (let i = 1; i <= this.mountain; ++i) {
      let generated = false;
      for (let count = 3, x, y; count; --count) {
        while (true) {
          x = getRandomInt(0, this.width);
          y = getRandomInt(0, this.height);
          if (this.isPlain(this.map[x][y])) break;
        }
        this.map[x][y].type = 'Mountain';
        if (this.checkConnection(i)) {
          generated = true;
          break;
        } else {
          this.map[x][y].type = 'Plain';
        }
      }
      if (!generated) {
        this.mountain = i - 1;
        console.log('Mountain Interrupted', i);
        break;
      }
    }
    console.log('Mountains generated successfully');
    // Generate the city
    for (let i = 1; i <= this.city; ++i) {
      let generated = false;
      for (let count = 3, x, y; count; --count) {
        while (true) {
          x = getRandomInt(0, this.width);
          y = getRandomInt(0, this.height);
          if (this.isPlain(this.map[x][y])) break;
        }
        this.map[x][y].type = 'City';
        if (this.checkConnection(i + this.mountain)) {
          generated = true;
          this.map[x][y].unit = getRandomInt(35, 55);
          break;
        } else {
          this.map[x][y].type = 'Plain';
        }
      }
      if (!generated) {
        this.city = i - 1;
        console.log('City Interrupted', i);
        break;
      }
    }
    console.log('Cities generated successfully');
    // Generate the swamp.
    for (let i = 1, x, y; i <= this.swamp; ++i) {
      while (true) {
        x = getRandomInt(0, this.width);
        y = getRandomInt(0, this.height);
        if (this.isPlain(this.map[x][y])) break;
      }
      this.map[x][y].type = 'Swamp';
    }
    console.log('Swamps generated successfully');
    let kings = this.kings;
    return new Promise(function (resolve, reject) {
      console.log('Map generated successfully');
      resolve(kings);
    });
  }

  getTotal(player: any): { army: number; land: number } {
    let total = 0,
      count = 0;
    for (let i = 0; i < this.width; ++i) {
      for (let j = 0; j < this.height; ++j) {
        if (this.map[i][j].player === player) {
          total += this.map[i][j].unit;
          ++count;
        }
      }
    }
    return { army: total, land: count };
  }

  getBlock(point: Point): Block {
    return this.map[point.x][point.y];
  }

  ownBlock(player: any, point: Point): boolean {
    return player === this.getBlock(point).player;
  }

  transferBlock(point: Point, player: any): void {
    this.map[point.x][point.y].player = player;
    this.map[point.x][point.y].unit = Math.ceil(
      this.map[point.x][point.y].unit / 2
    );
  }

  withinMap(point: Point): boolean {
    return (
      0 <= point.x &&
      point.x < this.width &&
      0 <= point.y &&
      point.y < this.height
    );
  }

  updateTurn(): void {
    this.turn++;
  }

  updateUnit(): void {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        switch (this.map[i][j].type) {
          case 'Plain':
            if (this.map[i][j].player && this.turn % 50 === 0)
              ++this.map[i][j].unit;
            break;
          case 'King':
            if (this.turn % 2 === 0) ++this.map[i][j].unit;
            break;
          case 'City':
            if (this.map[i][j].player && this.turn % 2 === 0)
              ++this.map[i][j].unit;
            break;
          case 'Swamp':
            if (this.map[i][j].player && this.turn % 2 === 0)
              --this.map[i][j].unit;
            if (this.map[i][j].unit === 0) this.map[i][j].player = null;
            break;
          default:
            break;
        }
      }
    }
  }

  command(
    player: any,
    type: string,
    focusData: { x: number; y: number },
    dirData: { x: number; y: number }
  ): void {
    const focus = new Point(focusData.x, focusData.y);
    const dir = new Point(dirData.x, dirData.y);
    const newFocus = focus.move(dir);
    if (this.commandable(player, focus, newFocus)) {
      switch (type) {
        case 'Click':
          this.moveAllMovableUnit(player, focus, newFocus);
          break;
        case 'DoubleClick':
          this.moveHalfMovableUnit(player, focus, newFocus);
          break;
        default:
          console.warn('Unexpected type of command', type);
      }
    }
  }

  commandable(player: any, focus: Point, newFocus: Point): boolean {
    const isOwner = this.ownBlock(player, focus);
    const possibleMove = this.withinMap(focus) && this.withinMap(newFocus);
    const notMountain = this.getBlock(newFocus).type !== 'Mountain';
    return isOwner && possibleMove && notMountain;
  }

  moveAllMovableUnit(player: any, focus: Point, newFocus: Point): void {
    const unit = this.getBlock(focus).getMovableUnit();
    this.moveUnit(player, unit, focus, newFocus);
  }

  moveHalfMovableUnit(player: any, focus: Point, newFocus: Point): void {
    const unit = this.getBlock(focus).getMovableUnit();
    const halfUnit = Math.ceil(unit / 2);
    this.moveUnit(player, halfUnit, focus, newFocus);
  }

  moveUnit(player: any, unit: number, focus: Point, newFocus: Point): void {
    this.getBlock(focus).leaveUnit(unit);
    this.getBlock(newFocus).enterUnit(player, unit);
  }

  getViewPlayer(player: any): Promise<Block[][]> {
    // Get the view of the player from the whole map
    console.log('Player is', player.username);
    const viewPlayer = Array.from(Array(this.width), () =>
      Array(this.height).fill(null)
    );

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const point = new Point(i, j);
        const block = this.getBlock(point);
        if (block.type === 'Mountain' || block.type === 'City') {
          viewPlayer[i][j] = { type: 'Obstacle', color: null, unit: null };
        } else {
          viewPlayer[i][j] = { type: 'Fog', color: null, unit: null };
        }
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const point = new Point(i, j);
        if (this.ownBlock(player, point)) {
          viewPlayer[point.x][point.y] = {
            type: this.map[point.x][point.y].type,
            color: player.color,
            unit: this.map[point.x][point.y].unit,
          };
          directions.forEach((dir) => {
            const newPoint = point.move(dir);
            if (this.withinMap(newPoint)) {
              viewPlayer[newPoint.x][newPoint.y] = {
                type: this.map[newPoint.x][newPoint.y].type,
                color: this.map[newPoint.x][newPoint.y].player
                  ? this.map[newPoint.x][newPoint.y].player.color
                  : null,
                unit: this.map[newPoint.x][newPoint.y].unit,
              };
            }
          });
        }
      }
    }
    return new Promise(function (resolve, reject) {
      console.log('View of player generated successfully');
      resolve(viewPlayer);
    });
  }
}

export default GameMap;
