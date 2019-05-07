namespace Fudge {
    export interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    export interface Border {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }

    export class MapRectangle {
        public normAnchor: Border = { left: 0, right: 0, top: 0, bottom: 0 };
        public pixelBorder: Border = { left: 0, right: 0, top: 0, bottom: 0 };

        public getRect(_rectFrame: Rectangle): Rectangle {
            if (!_rectFrame)
                return null;

            let minX: number = _rectFrame.x + this.normAnchor.left * _rectFrame.width + this.pixelBorder.left;
            let minY: number = _rectFrame.y + this.normAnchor.top * _rectFrame.height + this.pixelBorder.top;
            let maxX: number = _rectFrame.x + (1 - this.normAnchor.right) * _rectFrame.width - this.pixelBorder.right;
            let maxY: number = _rectFrame.y + (1 - this.normAnchor.bottom) * _rectFrame.height - this.pixelBorder.bottom;

            let rect: Rectangle = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            return rect;
        }
    }
}