namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimationSheetCurve extends ViewAnimationSheet {
    private static readonly MINIMUM_PIXEL_PER_STEP: number = 30;
    
    public drawCurves(): void {
      for (const sequence of this.sequences) {
        this.crc2.strokeStyle = sequence.color;
        sequence.sequence.getKeys()
          .map( (_key, _index, _keys) => [_key, _keys[_index + 1]] as [ƒ.AnimationKey, ƒ.AnimationKey] )
          .filter( ([_keyStart, _keyEnd]) => _keyStart && _keyEnd )
          .map ( ([_keyStart, _keyEnd]) => this.getBezierPoints(_keyStart.functionOut, _keyStart, _keyEnd) )
          .forEach( (_bezierPoints) => {
            _bezierPoints.forEach( _point => _point.transform(this.mtxWorldToScreen));
            let curve: Path2D = new Path2D();
            curve.moveTo(_bezierPoints[0].x, _bezierPoints[0].y);
            curve.bezierCurveTo(
              _bezierPoints[1].x, _bezierPoints[1].y,
              _bezierPoints[2].x, _bezierPoints[2].y,
              _bezierPoints[3].x, _bezierPoints[3].y
            );
            this.crc2.stroke(curve);
            _bezierPoints.forEach( _point => ƒ.Recycler.store(_point) );
          });
      }
    }

    public drawScale(): void {
      this.crc2.fillStyle = window.getComputedStyle(this.dom).getPropertyValue("--color-text");
      this.crc2.strokeStyle = window.getComputedStyle(this.dom).getPropertyValue("--color-text");

      let centerLine: Path2D = new Path2D();
      centerLine.moveTo(0, this.mtxWorldToScreen.translation.y);
      centerLine.lineTo(this.canvas.width, this.mtxWorldToScreen.translation.y);
      this.crc2.stroke(centerLine);

      this.crc2.textBaseline = "bottom";
      this.crc2.textAlign = "right";

      let pixelPerStep: number = -this.mtxWorldToScreen.scaling.y;
      let valuePerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(ViewAnimationSheetCurve.MINIMUM_PIXEL_PER_STEP / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      valuePerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.height / pixelPerStep;
      let stepOffset: number = Math.floor(-this.mtxWorldToScreen.translation.y / pixelPerStep);
      for (let i: number = stepOffset; i < steps + stepOffset; i++) {
        let stepLine: Path2D = new Path2D();
        let y: number = (i * pixelPerStep + this.mtxWorldToScreen.translation.y);
        stepLine.moveTo(0, y);
        // TODO: refine the display
        if (valuePerStep > 1 && i % 5 == 0 || valuePerStep == 1) {
          stepLine.lineTo(35, y);
          let value: number = -i * valuePerStep;
          this.crc2.fillText(
            valuePerStep >= 1 ? value.toFixed(0) : value.toFixed(1), 
            33, 
            y);
        } else {
          stepLine.lineTo(30, y);
        }
        this.crc2.stroke(stepLine);
      }
    }

    protected generateKeys(): void {
      this.keys = this.sequences.flatMap( (_sequence) => 
        _sequence.sequence.getKeys().map( _key => {
          let pos: ƒ.Vector2 = ƒ.Recycler.get(ƒ.Vector2);
          pos.set(_key.Time, _key.Value);
          pos.transform(this.mtxWorldToScreen);

          let viewKey: ViewAnimationKey = {
            key: _key,
            path2D: this.generateKey(
              pos.x,
              pos.y,
              ViewAnimationSheet.KEY_SIZE,
              ViewAnimationSheet.KEY_SIZE
            ),
            sequence: _sequence
          };
          ƒ.Recycler.store(ƒ.Vector2);
          return viewKey;
        })
      );
    }

    private getBezierPoints(_animationFunction: ƒ.AnimationFunction, _keyStart: ƒ.AnimationKey, _keyEnd: ƒ.AnimationKey): ƒ.Vector2[] {
      let parameters: { a: number; b: number; c: number; d: number } = _animationFunction.getParameters();
      let polarForm: (u: number, v: number, w: number) => number = (u, v, w) => {
        return (
          parameters.a * u * v * w +
          parameters.b * ((v * w + w * u + u * v) / 3) +
          parameters.c * ((u + v + w) / 3) +
          parameters.d
        );
      };
      let xStart: number = _keyStart.Time;
      let xEnd: number = _keyEnd.Time;
      let offsetTimeEnd: number = xEnd - xStart;

      let points: ƒ.Vector2[] = new Array(4).fill(0).map( () => ƒ.Recycler.get(ƒ.Vector2));
      points[0].set(xStart, polarForm(0, 0, 0));
      points[1].set(xStart + offsetTimeEnd * 1 / 3, polarForm(0, 0, offsetTimeEnd));
      points[2].set(xStart + offsetTimeEnd * 2 / 3, polarForm(0, offsetTimeEnd, offsetTimeEnd));
      points[3].set(xStart + offsetTimeEnd, polarForm(offsetTimeEnd, offsetTimeEnd, offsetTimeEnd));

      return points;
    }
  }
}
