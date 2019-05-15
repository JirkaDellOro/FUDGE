namespace Fudge {
    export interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    export interface Border {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }

    export interface Point { //TODO: replace by Vector2
        x: number;
        y: number;
    }
    /**
     * Framing describes how to map a rectangle into a given frame
     * and how points in the frame correspond to points in the resulting rectangle 
     */
    export abstract class Framing extends Mutable {
        public abstract getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point;
        public abstract getPointInverse(_point: Point, _rect: Rectangle): Point;
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

        public setSize(_width: number, _height: number): void {
            this.width = _width;
            this.height = _height;
        }

        public getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point {
            let result: Point = {
                x: this.width * (_pointInFrame.x - _rectFrame.x) / _rectFrame.width,
                y: this.height * (_pointInFrame.y - _rectFrame.y) / _rectFrame.height
            };
            return result;
        }

        public getPointInverse(_point: Point, _rect: Rectangle): Point {
            let result: Point = {
                x: _point.x * _rect.width / this.width + _rect.x,
                y: _point.y * _rect.height / this.height + _rect.y
            };
            return result;
        }

        public getRect(_rectFrame: Rectangle): Rectangle {
            return { x: 0, y: 0, width: this.width, height: this.height };
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

        public getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point {
            let result: Point = {
                x: this.normWidth * (_pointInFrame.x - _rectFrame.x),
                y: this.normHeight * (_pointInFrame.y - _rectFrame.y)
            };
            return result;
        }

        public getPointInverse(_point: Point, _rect: Rectangle): Point {
            let result: Point = {
                x: _point.x / this.normWidth + _rect.x,
                y: _point.y / this.normHeight + _rect.y
            };
            return result;
        }

        public getRect(_rectFrame: Rectangle): Rectangle {
            return { x: 0, y: 0, width: this.normWidth * _rectFrame.width, height: this.normHeight * _rectFrame.height };
        }
    }

    /**
     * The resulting rectangle fits into a margin given as fractions of the size of the frame given by normAnchor
     * plus an absolute padding given by pixelBorder. Display should fit into this.
     */
    export class FramingComplex extends Framing {
        public margin: Border = { left: 0, top: 0, right: 0, bottom: 0 };
        public padding: Border = { left: 0, top: 0, right: 0, bottom: 0 };

        public getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point {
            let result: Point = {
                x: _pointInFrame.x - this.padding.left - this.margin.left * _rectFrame.width,
                y: _pointInFrame.y - this.padding.top - this.margin.top * _rectFrame.height
            };
            return result;
        }
        public getPointInverse(_point: Point, _rect: Rectangle): Point {
            let result: Point = {
                x: _point.x + this.padding.left + this.margin.left * _rect.width,
                y: _point.y + this.padding.top + this.margin.top * _rect.height
            };
            return result;
        }

        public getRect(_rectFrame: Rectangle): Rectangle {
            if (!_rectFrame)
                return null;

            let minX: number = _rectFrame.x + this.margin.left * _rectFrame.width + this.padding.left;
            let minY: number = _rectFrame.y + this.margin.top * _rectFrame.height + this.padding.top;
            let maxX: number = _rectFrame.x + (1 - this.margin.right) * _rectFrame.width - this.padding.right;
            let maxY: number = _rectFrame.y + (1 - this.margin.bottom) * _rectFrame.height - this.padding.bottom;

            let rect: Rectangle = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            return rect;
        }

        public getMutator(): Mutator {
            return {margin: this.margin, padding: this.padding};
        }
    }
}