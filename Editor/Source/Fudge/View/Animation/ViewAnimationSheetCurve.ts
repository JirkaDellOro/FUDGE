namespace Fudge {
  import ƒ = FudgeCore;

  export class ViewAnimationSheetCurve extends ViewAnimationSheet {
    drawKeys(): void {
      this.drawYScale();
      super.drawKeys();
    }

    protected drawSequence(_sequence: ƒ.AnimationSequence): void {
      if (_sequence.length <= 0) return;

      let rect: DOMRect | ClientRect = new DOMRect(1, 1, 20, 20); //_input.getBoundingClientRect();
      let height: number = rect.height / this.scale.y;
      let width: number = rect.height / this.scale.x;
      // let line: Path2D = new Path2D();
      // line.moveTo(0, _sequence.getKey(0).Value);

      //TODO: stop recreating the sequence element all the time
      //TODO: get color from input element or former sequence element.
      // let seq: ViewAnimationSequence = { color: this.randomColor(), element: _input, sequence: _sequence };
      let seq: ViewAnimationSequence = {
        color: this.randomColor(),
        sequence: _sequence
      };
      this.sequences.push(seq);
      this.crc2.beginPath();
      this.crc2.strokeStyle = seq.color;
      for (let i: number = 0; i < _sequence.length; i++) {
        let key: ƒ.AnimationKey = _sequence.getKey(i);
        // console.log(key);
        this.keys.push({
          key: key,
          path2D: this.drawKey(
            key.Time,
            -key.Value,
            height / 2,
            width / 2,
            seq.color
          ),
          sequence: seq
        });
        if (i < _sequence.length - 1) {
          let bezierPoints: { x: number; y: number }[] = this.getBezierPoints(key.functionOut, key, _sequence.getKey(i + 1));
          this.crc2.moveTo(bezierPoints[0].x, -bezierPoints[0].y);
          this.crc2.bezierCurveTo(
            bezierPoints[1].x, -bezierPoints[1].y,
            bezierPoints[2].x, -bezierPoints[2].y,
            bezierPoints[3].x, -bezierPoints[3].y
          );
        }
        // line.lineTo(k.Time, -k.Value);
      }
      // line.lineTo(
      //   this.view.animation.totalTime,
      //   _sequence.getKey(_sequence.length - 1).Value
      // );
      this.crc2.stroke();
    }

    protected drawKey(
      _x: number,
      _y: number,
      _h: number,
      _w: number,
      _c: string
    ): Path2D {
      return super.drawKey(_x, _y, _h, _w, _c);
    }

    private drawYScale(): void {
      let pixelPerValue: number = this.calcScaleSize();
      let valuePerPixel: number = 1 / pixelPerValue;

      this.crc2.strokeStyle = "green";
      this.crc2.lineWidth = 1;
      let line: Path2D = new Path2D();
      line.moveTo(0, 0);
      line.lineTo(100000, 0);
      this.crc2.stroke(line);

      this.crc2.fillStyle = "yellow";
      this.crc2.strokeStyle = "yellow";
      // this.crc2.lineWidth = 1;
      line = new Path2D();
      line.moveTo(0, -200);
      line.lineTo(this.crc2.lineWidth, 400);
      this.crc2.stroke(line);

      this.crc2.lineWidth = 0.5;
      this.crc2.textBaseline = "middle";
      for (let i: number = 0; i < 11; i++) {
        let y: number = -50 + i * 10;
        line = new Path2D();
        line.moveTo(this.crc2.lineWidth, y);
        line.lineTo(this.crc2.lineWidth + 2000, y);
        this.crc2.stroke(line);
        this.crc2.fillText((-y).toString(), this.crc2.lineWidth + 15, y);
      }
    }

    private calcScaleSize(): number {
      let min: number = 10;
      let max: number = 50;
      let pixelPerValue: number = this.scale.y;
      while (pixelPerValue < min) {
        pixelPerValue *= 10;
      }
      while (pixelPerValue > max) {
        pixelPerValue /= 2;
      }
      return pixelPerValue;
    }

    private randomColor(): string {
      return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
    }

    private getBezierPoints(_animationFunction: ƒ.AnimationFunction, keyIn: ƒ.AnimationKey, keyOut: ƒ.AnimationKey): { x: number; y: number }[] {
      let parameters: { a: number; b: number; c: number; d: number } =
        _animationFunction.getParameters();
      let polarForm: (u: number, v: number, w: number) => number = (u, v, w) => {
        return (
          parameters.a * u * v * w +
          parameters.b * ((v * w + w * u + u * v) / 3) +
          parameters.c * ((u + v + w) / 3) +
          parameters.d
        );
      };
      let timeStart: number = keyIn.Time;
      let timeEnd: number = keyOut.Time;
      let offsetTimeEnd: number = timeEnd - timeStart;
      return [
        {x: timeStart, y: polarForm(0, 0, 0)},
        {x: timeStart + offsetTimeEnd * 1 / 3, y: polarForm(0, 0, offsetTimeEnd)},
        {x: timeStart + offsetTimeEnd * 2 / 3, y: polarForm(0, offsetTimeEnd, offsetTimeEnd)},
        {x: timeStart + offsetTimeEnd, y: polarForm(offsetTimeEnd, offsetTimeEnd, offsetTimeEnd)}
      ];
    }
  }
}
