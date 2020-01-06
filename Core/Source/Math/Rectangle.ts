namespace FudgeCore {
  /**
   * Defines the origin of a rectangle
   */
  export enum ORIGIN2D {
    TOPLEFT = 0x00,
    TOPCENTER = 0x01,
    TOPRIGHT = 0x02,
    CENTERLEFT = 0x10,
    CENTER = 0x11,
    CENTERRIGHT = 0x12,
    BOTTOMLEFT = 0x20,
    BOTTOMCENTER = 0x21,
    BOTTOMRIGHT = 0x22
  }

  /**
   * Defines a rectangle with position and size and add comfortable methods to it
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Rectangle extends Mutable {
    public position: Vector2 = Recycler.get(Vector2);
    public size: Vector2 = Recycler.get(Vector2);

    constructor(_x: number = 0, _y: number = 0, _width: number = 1, _height: number = 1, _origin: ORIGIN2D = ORIGIN2D.TOPLEFT) {
      super();
      this.setPositionAndSize(_x, _y, _width, _height, _origin);
    }

    /**
     * Returns a new rectangle created with the given parameters
     */
    public static GET(_x: number = 0, _y: number = 0, _width: number = 1, _height: number = 1, _origin: ORIGIN2D = ORIGIN2D.TOPLEFT): Rectangle {
      let rect: Rectangle = Recycler.get(Rectangle);
      rect.setPositionAndSize(_x, _y, _width, _height);
      return rect;
    }

    /**
     * Sets the position and size of the rectangle according to the given parameters
     */
    public setPositionAndSize(_x: number = 0, _y: number = 0, _width: number = 1, _height: number = 1, _origin: ORIGIN2D = ORIGIN2D.TOPLEFT): void {
      this.size.set(_width, _height);
      switch (_origin & 0x03) {
        case 0x00: this.position.x = _x; break;
        case 0x01: this.position.x = _x - _width / 2; break;
        case 0x02: this.position.x = _x - _width; break;
      }
      switch (_origin & 0x30) {
        case 0x00: this.position.y = _y; break;
        case 0x10: this.position.y = _y - _height / 2; break;
        case 0x20: this.position.y = _y - _height; break;
      }
    }

    public pointToRect(_point: Vector2, _target: Rectangle): Vector2 {
      let result: Vector2 = _point.copy;
      result.subtract(this.position);
      result.x *= _target.width / this.width;
      result.y *= _target.height / this.height;
      result.add(_target.position);
      return result;
    }

    get x(): number {
      return this.position.x;
    }
    get y(): number {
      return this.position.y;
    }
    get width(): number {
      return this.size.x;
    }
    get height(): number {
      return this.size.y;
    }

    get left(): number {
      return this.position.x;
    }
    get top(): number {
      return this.position.y;
    }
    get right(): number {
      return this.position.x + this.size.x;
    }
    get bottom(): number {
      return this.position.y + this.size.y;
    }

    set x(_x: number) {
      this.position.x = _x;
    }
    set y(_y: number) {
      this.position.y = _y;
    }
    set width(_width: number) {
      this.position.x = _width;
    }
    set height(_height: number) {
      this.position.y = _height;
    }
    set left(_value: number) {
      this.size.x = this.right - _value;
      this.position.x = _value;
    }
    set top(_value: number) {
      this.size.y = this.bottom - _value;
      this.position.y = _value;
    }
    set right(_value: number) {
      this.size.x = this.position.x + _value;
    }
    set bottom(_value: number) {
      this.size.y = this.position.y + _value;
    }

    public get copy(): Rectangle {
      return Rectangle.GET(this.x, this.y, this.width, this.height);
    }

    /**
     * Returns true if the given point is inside of this rectangle or on the border
     * @param _point
     */
    public isInside(_point: Vector2): boolean {
      return (_point.x >= this.left && _point.x <= this.right && _point.y >= this.top && _point.y <= this.bottom);
    }

    public toString(): string {
      let result: string = `ƒ.Rectangle(position:${this.position.toString()}, size:${this.size.toString()}`;
      result += `, left:${this.left.toPrecision(5)}, top:${this.top.toPrecision(5)}, right:${this.right.toPrecision(5)}, bottom:${this.bottom.toPrecision(5)}`;
      return result;
    }

    protected reduceMutator(_mutator: Mutator): void {/* */ }
  }
}