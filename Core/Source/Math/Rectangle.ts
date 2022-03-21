///<reference path="../Recycle/Recycler.ts"/>
///<reference path="Vector2.ts"/>

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
  export class Rectangle extends Mutable implements Recycable {
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

    /**
     * Return the leftmost expansion, respecting also negative values of width
     */
    get left(): number {
      if (this.size.x > 0)
        return this.position.x;
      return (this.position.x + this.size.x);
    }
    /**
     * Return the topmost expansion, respecting also negative values of height
     */
    get top(): number {
      if (this.size.y > 0)
        return this.position.y;
      return (this.position.y + this.size.y);
    }
    /**
     * Return the rightmost expansion, respecting also negative values of width
     */
    get right(): number {
      if (this.size.x > 0)
        return (this.position.x + this.size.x);
      return this.position.x;
    }
    /**
     * Return the lowest expansion, respecting also negative values of height
     */
    get bottom(): number {
      if (this.size.y > 0)
        return (this.position.y + this.size.y);
      return this.position.y;
    }

    set x(_x: number) {
      this.position.x = _x;
    }
    set y(_y: number) {
      this.position.y = _y;
    }
    set width(_width: number) {
      this.size.x = _width;
    }
    set height(_height: number) {
      this.size.y = _height;
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
    
    public get clone(): Rectangle {
      return Rectangle.GET(this.x, this.y, this.width, this.height);
    }

    public recycle(): void {
      this.setPositionAndSize();
    }

    public copy(_rect: Rectangle): void {
      this.setPositionAndSize(_rect.x, _rect.y, _rect.width, _rect.height);
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
      let result: Vector2 = _point.clone;
      result.subtract(this.position);
      result.x *= _target.width / this.width;
      result.y *= _target.height / this.height;
      result.add(_target.position);
      return result;
    }

    /**
     * Returns true if the given point is inside of this rectangle or on the border
     * @param _point
     */
    public isInside(_point: Vector2): boolean {
      return (_point.x >= this.left && _point.x <= this.right && _point.y >= this.top && _point.y <= this.bottom);
    }

    /**
     * Returns true if this rectangle collides with the rectangle given
     * @param _rect 
     */
    public collides(_rect: Rectangle): boolean {
      if (this.left > _rect.right) return false;
      if (this.right < _rect.left) return false;
      if (this.top > _rect.bottom) return false;
      if (this.bottom < _rect.top) return false;
      return true;
    }

    /**
     * Returns the rectangle created by the intersection of this and the given rectangle or null, if they don't collide
     */
    public getIntersection(_rect: Rectangle): Rectangle {
      if (!this.collides(_rect))
        return null;

      let intersection: Rectangle = new Rectangle();
      intersection.x = Math.max(this.left, _rect.left);
      intersection.y = Math.max(this.top, _rect.top);
      intersection.width = Math.min(this.right, _rect.right) - intersection.x;
      intersection.height = Math.min(this.bottom, _rect.bottom) - intersection.y;

      return intersection;
    }

    /**
 * Returns the rectangle created by the intersection of this and the given rectangle or null, if they don't collide
 */
    public covers(_rect: Rectangle): boolean {
      if (this.left > _rect.left) return false;
      if (this.right < _rect.right) return false;
      if (this.top > _rect.top) return false;
      if (this.bottom < _rect.bottom) return false;
      return true;
    }

    /**
     * Creates a string representation of this rectangle
     */
    public toString(): string {
      let result: string = `ƒ.Rectangle(position:${this.position.toString()}, size:${this.size.toString()}`;
      result += `, left:${this.left.toPrecision(5)}, top:${this.top.toPrecision(5)}, right:${this.right.toPrecision(5)}, bottom:${this.bottom.toPrecision(5)}`;
      return result;
    }

    protected reduceMutator(_mutator: Mutator): void {/* */ }
  }
}