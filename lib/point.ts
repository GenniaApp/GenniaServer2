class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  move(direction: Point): Point {
    return new Point(this.x + direction.x, this.y + direction.y);
  }

  negative(): Point {
    return new Point(-this.x, -this.y);
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }

  toString(): string {
    return `Point (${this.x}, ${this.y})`;
  }

  toObject(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
}

export default Point;