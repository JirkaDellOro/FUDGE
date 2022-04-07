namespace Fudge {
  export class ViewAnimationSheetCurve extends ViewAnimationSheet {
    drawKeys(): void {
      this.drawYScale();
      super.drawKeys();
    }

    protected newDrawSequence(_sequence: ƒ.AnimationSequence): void {
      if (_sequence.length <= 0) return;

      let rect: DOMRect | ClientRect = new DOMRect(1, 1, 20, 20); //_input.getBoundingClientRect();
      let height: number = rect.height / this.scale.y;
      let width: number = rect.height / this.scale.x;
      let line: Path2D = new Path2D();
      line.moveTo(0, _sequence.getKey(0).Value);

      //TODO: stop recreating the sequence element all the time
      //TODO: get color from input element or former sequence element.
      // let seq: ViewAnimationSequence = { color: this.randomColor(), element: _input, sequence: _sequence };
      let seq: ViewAnimationSequence = {
        color: this.randomColor(),
        sequence: _sequence
      };
      this.sequences.push(seq);

      for (let i: number = 0; i < _sequence.length; i++) {
        let k: FudgeCore.AnimationKey = _sequence.getKey(i);
        this.keys.push({
          key: k,
          path2D: this.drawKey(
            k.Time,
            -k.Value,
            height / 2,
            width / 2,
            seq.color
          ),
          sequence: seq
        });
        line.lineTo(k.Time, -k.Value);
      }
      line.lineTo(
        this.view.animation.totalTime,
        _sequence.getKey(_sequence.length - 1).Value
      );

      this.crc2.strokeStyle = seq.color;
      this.crc2.stroke(line);
    }

    // protected drawSequence(
    //   _sequence: FudgeCore.AnimationSequence,
    //   _input: HTMLInputElement
    // ): void {
    //   if (_sequence.length <= 0) return;
    //   let rect: DOMRect | ClientRect = new DOMRect(0, 0, 1, 1); //_input.getBoundingClientRect();
    //   let height: number = rect.height / this.scale.y;
    //   let width: number = rect.height / this.scale.x;
    //   let line: Path2D = new Path2D();
    //   line.moveTo(0, _sequence.getKey(0).Value);

    //   //TODO: stop recreating the sequence element all the time
    //   //TODO: get color from input element or former sequence element.
    //   let seq: ViewAnimationSequence = {
    //     color: this.randomColor(),
    //     sequence: _sequence
    //   };
    //   this.sequences.push(seq);

    //   for (let i: number = 0; i < _sequence.length; i++) {
    //     let k: FudgeCore.AnimationKey = _sequence.getKey(i);
    //     this.keys.push({
    //       key: k,
    //       path2D: this.drawKey(
    //         k.Time,
    //         k.Value,
    //         height / 2,
    //         width / 2,
    //         seq.color
    //       ),
    //       sequence: seq
    //     });
    //     line.lineTo(k.Time, k.Value);
    //   }
    //   line.lineTo(
    //     this.view.animation.totalTime,
    //     _sequence.getKey(_sequence.length - 1).Value
    //   );

    //   this.crc2.strokeStyle = seq.color;
    //   this.crc2.stroke(line);
    // }

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
      this.crc2.lineWidth = 1 / this.scale.y;
      let line: Path2D = new Path2D();
      line.moveTo(0, 0);
      line.lineTo(100000, 0);
      this.crc2.stroke(line);

      this.crc2.fillStyle = "yellow";
      this.crc2.strokeStyle = "yellow";
      this.crc2.lineWidth = 1 / this.scale.x;
      line = new Path2D();
      line.moveTo(0, -200);
      line.lineTo(this.crc2.lineWidth, 400);
      this.crc2.stroke(line);

      this.crc2.lineWidth = 1;
      this.crc2.textBaseline = "middle";
      for (let i: number = 0; i < 11; i++) {
        let y: number =  - 50 + i * 10;
        line = new Path2D();
        line.moveTo(this.crc2.lineWidth, y);
        line.lineTo(this.crc2.lineWidth + 10, y);
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
  }
}
