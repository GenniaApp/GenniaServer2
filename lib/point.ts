export default class Point {
  constructor(
    public x: number,
    public y: number
  ) {}

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
}
