var Fudge;
(function (Fudge) {
    class ViewAnimationSheetCurve extends Fudge.ViewAnimationSheet {
        drawKeys() {
            this.drawYScale();
            super.drawKeys();
        }
        drawSequence(_sequence, _input) {
            if (_sequence.length <= 0)
                return;
            let rect = _input.getBoundingClientRect();
            let height = rect.height / this.scale.y;
            let width = rect.height / this.scale.x;
            let line = new Path2D();
            line.moveTo(0, _sequence.getKey(0).Value);
            //TODO: stop recreating the sequence element all the time
            //TODO: get color from input element or former sequence element.
            let seq = { color: this.randomColor(), element: _input, sequence: _sequence };
            this.sequences.push(seq);
            for (let i = 0; i < _sequence.length; i++) {
                let k = _sequence.getKey(i);
                this.keys.push({ key: k, path2D: this.drawKey(k.Time, k.Value, height / 2, width / 2, seq.color), sequence: seq });
                line.lineTo(k.Time, k.Value);
            }
            line.lineTo(this.view.animation.totalTime, _sequence.getKey(_sequence.length - 1).Value);
            this.crc2.strokeStyle = seq.color;
            this.crc2.stroke(line);
        }
        drawKey(_x, _y, _h, _w, _c) {
            return super.drawKey(_x, _y, _h, _w, _c);
        }
        drawYScale() {
            let pixelPerValue = this.calcScaleSize();
            let valuePerPixel = 1 / pixelPerValue;
            this.crc2.strokeStyle = "black";
            this.crc2.lineWidth = 1 / this.scale.y;
            let line = new Path2D;
            line.moveTo(0, 0);
            line.lineTo(100000, 0);
            this.crc2.stroke(line);
        }
        calcScaleSize() {
            let min = 10;
            let max = 50;
            let pixelPerValue = this.scale.y;
            while (pixelPerValue < min) {
                pixelPerValue *= 10;
            }
            while (pixelPerValue > max) {
                pixelPerValue /= 2;
            }
            return pixelPerValue;
        }
        randomColor() {
            return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
        }
    }
    Fudge.ViewAnimationSheetCurve = ViewAnimationSheetCurve;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=ViewAnimationSheetCurve.js.map