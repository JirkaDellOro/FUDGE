namespace FudgeCore {
  export interface Border {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }

  /**
   * Framing describes how to map a rectangle into a given frame
   * and how points in the frame correspond to points in the resulting rectangle and vice versa
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019  
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Framing
   */
  export abstract class Framing extends Mutable {
    /**
     * Maps a point in the given frame according to this framing
     * @param _pointInFrame The point in the frame given
     * @param _rectFrame The frame the point is relative to
     */
    public abstract getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2;

    /**
     * Maps a point in a given rectangle back to a calculated frame of origin
     * @param _point The point in the rectangle
     * @param _rect The rectangle the point is relative to
     */
    public abstract getPointInverse(_point: Vector2, _rect: Rectangle): Vector2;

    /**
     * Takes a rectangle as the frame and creates a new rectangle according to the framing
     * @param _rectFrame
     */
    public abstract getRect(_rectFrame: Rectangle): Rectangle;
    protected reduceMutator(_mutator: Mutator): void {/** */ }
  }

  /**
   * The resulting rectangle has a fixed width and height and display should scale to fit the frame
   * Points are scaled in the same ratio
   */
  export class FramingFixed extends Framing {
    public width: number = 300;
    public height: number = 150;

    public constructor(_width: number = 300, _height: number = 150) {
      super();
      this.setSize(_width, _height);
    }

    public setSize(_width: number, _height: number): void {
      this.width = _width;
      this.height = _height;
    }

    public getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2 {
      let result: Vector2 = new Vector2(
        this.width * (_pointInFrame.x - _rectFrame.x) / _rectFrame.width,
        this.height * (_pointInFrame.y - _rectFrame.y) / _rectFrame.height
      );
      return result;
    }

    public getPointInverse(_point: Vector2, _rect: Rectangle): Vector2 {
      let result: Vector2 = new Vector2(
        _point.x * _rect.width / this.width + _rect.x,
        _point.y * _rect.height / this.height + _rect.y
      );
      return result;
    }

    public getRect(_rectFrame: Rectangle): Rectangle {
      return Rectangle.GET(0, 0, this.width, this.height);
    }
  }
  /**
   * Width and height of the resulting rectangle are fractions of those of the frame, scaled by normed values normWidth and normHeight.
   * Display should scale to fit the frame and points are scaled in the same ratio
   */
  export class FramingScaled extends Framing {
    public normWidth: number = 1.0;
    public normHeight: number = 1.0;

    public setScale(_normWidth: number, _normHeight: number): void {
      this.normWidth = _normWidth;
      this.normHeight = _normHeight;
    }

    public getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2 {
      let result: Vector2 = new Vector2(
        this.normWidth * (_pointInFrame.x - _rectFrame.x),
        this.normHeight * (_pointInFrame.y - _rectFrame.y)
      );
      return result;
    }

    public getPointInverse(_point: Vector2, _rect: Rectangle): Vector2 {
      let result: Vector2 = new Vector2(
        _point.x / this.normWidth + _rect.x,
        _point.y / this.normHeight + _rect.y
      );
      return result;
    }

    public getRect(_rectFrame: Rectangle): Rectangle {
      return Rectangle.GET(0, 0, this.normWidth * _rectFrame.width, this.normHeight * _rectFrame.height);
    }
  }

  /**
   * The resulting rectangle fits into a margin given as fractions of the size of the frame given by normAnchor
   * plus an absolute padding given by pixelBorder. Display should fit into this.
   */
  export class FramingComplex extends Framing {
    public margin: Border = { left: 0, top: 0, right: 0, bottom: 0 };
    public padding: Border = { left: 0, top: 0, right: 0, bottom: 0 };

    public getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2 {
      let result: Vector2 = new Vector2(
        _pointInFrame.x - this.padding.left - this.margin.left * _rectFrame.width,
        _pointInFrame.y - this.padding.top - this.margin.top * _rectFrame.height
      );
      return result;
    }
    public getPointInverse(_point: Vector2, _rect: Rectangle): Vector2 {
      let result: Vector2 = new Vector2(
        _point.x + this.padding.left + this.margin.left * _rect.width,
        _point.y + this.padding.top + this.margin.top * _rect.height
      );
      return result;
    }

    public getRect(_rectFrame: Rectangle): Rectangle {
      if (!_rectFrame)
        return null;

      let minX: number = _rectFrame.x + this.margin.left * _rectFrame.width + this.padding.left;
      let minY: number = _rectFrame.y + this.margin.top * _rectFrame.height + this.padding.top;
      let maxX: number = _rectFrame.x + (1 - this.margin.right) * _rectFrame.width - this.padding.right;
      let maxY: number = _rectFrame.y + (1 - this.margin.bottom) * _rectFrame.height - this.padding.bottom;

      return Rectangle.GET(minX, minY, maxX - minX, maxY - minY);
    }

    public getMutator(): Mutator {
      return { margin: this.margin, padding: this.padding };
    }
  }
}