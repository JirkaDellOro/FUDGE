namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimationSheetCurve extends ViewAnimationSheet {
    private readonly pixelPerValue: number = 100;

    public drawTimeline(): void {
      this.drawYScale();
      super.drawTimeline();
    }

    protected drawSequence(_sequence: ƒ.AnimationSequence, _color: string): void {
      if (_sequence.length <= 0) return;

      let rect: DOMRect | ClientRect = new DOMRect(1, 1, 20, 20); //_input.getBoundingClientRect();
      let height: number = rect.height / this.transform.scaling.y;
      let width: number = rect.height / this.transform.scaling.x;
      // let line: Path2D = new Path2D();
      // line.moveTo(0, _sequence.getKey(0).Value);

      //TODO: stop recreating the sequence element all the time
      //TODO: get color from input element or former sequence element.
      // let seq: ViewAnimationSequence = { color: this.randomColor(), element: _input, sequence: _sequence };
      let seq: ViewAnimationSequence = {
        color: _color,
        sequence: _sequence
      };
      this.sequences.push(seq);
      this.crc2.beginPath();
      this.crc2.strokeStyle = seq.color;
      for (let i: number = 0; i < _sequence.length; i++) {
        let key: ƒ.AnimationKey = _sequence.getKey(i);
        this.keys.push({
          key: key,
          path2D: this.drawKey(
            key.Time,
            -key.Value * this.pixelPerValue,
            height / 2,
            width / 2,
            seq.color
          ),
          sequence: seq
        });
        if (i < _sequence.length - 1) {
          let bezierPoints: { x: number; y: number }[] = this.getBezierPoints(key.functionOut, key, _sequence.getKey(i + 1));
          this.crc2.moveTo(bezierPoints[0].x, -bezierPoints[0].y * this.pixelPerValue);
          this.crc2.bezierCurveTo(
            bezierPoints[1].x, -bezierPoints[1].y * this.pixelPerValue,
            bezierPoints[2].x, -bezierPoints[2].y * this.pixelPerValue,
            bezierPoints[3].x, -bezierPoints[3].y * this.pixelPerValue
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
      this.crc2.resetTransform();
      
      this.crc2.strokeStyle = "blue";
      this.crc2.lineWidth = 1;

      let centerLine: Path2D = new Path2D();
      centerLine.moveTo(0, this.transform.translation.y);
      centerLine.lineTo(this.canvas.width, this.transform.translation.y);
      this.crc2.stroke(centerLine);

      this.crc2.fillStyle = "grey";
      this.crc2.strokeStyle = "grey";
      this.crc2.textBaseline = "bottom";
      this.crc2.textAlign = "right";

      const minimumPixelPerStep: number = 30;
      let pixelPerStep: number = this.pixelPerValue * this.transform.scaling.y;
      let valuePerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      valuePerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.height / pixelPerStep;
      let stepOffset: number = Math.floor(-this.transform.translation.y / pixelPerStep);
      for (let i: number = stepOffset; i < steps + stepOffset; i++) {
        let stepLine: Path2D = new Path2D();
        let y: number = (i * pixelPerStep + this.transform.translation.y);
        stepLine.moveTo(0, y);
        // TODO: refine the display
        if (valuePerStep > 1 && i % 5 == 0 || valuePerStep == 1) {
          this.crc2.lineWidth = 0.6;
          stepLine.lineTo(35, y);
          let value: number = -i * valuePerStep;
          this.crc2.fillText(
            valuePerStep >= 1 ? value.toFixed(0) : value.toFixed(1), 
            33, 
            y);
        } else {
          this.crc2.lineWidth = 0.3;
          stepLine.lineTo(30, y);
        }
        this.crc2.stroke(stepLine);
      }
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
