namespace FudgeViewAnimation {
  export abstract class ViewAnimationSheet {
    view: ViewAnimation;
    seq: FudgeCore.AnimationSequence[];
    crc2: CanvasRenderingContext2D;
    scale: FudgeCore.Vector2;
    protected position: FudgeCore.Vector2;
    protected savedImage: ImageData;
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];

    constructor(_view: ViewAnimation, _crc: CanvasRenderingContext2D, _seq: FudgeCore.AnimationSequence[], _scale: FudgeCore.Vector2 = new FudgeCore.Vector2(1, 1), _pos: FudgeCore.Vector2 = new FudgeCore.Vector2()) {
      this.view = _view;
      this.crc2 = _crc;
      this.seq = _seq;
      this.scale = _scale;
      this.position = _pos;
    }
    moveTo(_time: number, _value: number = this.position.y): void {
      this.position.x = _time;
      this.position.y = _value;
    }
    translate(): void {
      this.crc2.translate(this.position.x, this.position.y);
    }
    redraw(): void {
      this.translate();
      this.drawTimeline();
      this.drawEventsLabels();
    }
    drawTimeline(): void {
      let timelineHeight: number = 50;
      let timeline: Path2D = new Path2D();
      timeline.moveTo(0, timelineHeight);
      //TODO make this use some actually sensible numbers, maybe 2x the animation length
      let maxDistance: number = 10000;
      timeline.lineTo(maxDistance, timelineHeight);
      //TODO: make this scale nicely/use the animations SPS
      let baseWidth: number = 1000;
      let pixelPerSecond: number = Math.floor(baseWidth * this.scale.x);
      let stepsPerSecond: number = 1;
      let stepsPerDisplayText: number = 1;
      [stepsPerSecond, stepsPerDisplayText] = this.calculateDisplay(pixelPerSecond);
      let pixelPerStep: number = pixelPerSecond / stepsPerSecond;
      let steps: number = 0;
      // console.log(pixelPerSecond, pixelPerStep);
      for (let i: number = 0; i < maxDistance; i += pixelPerStep) {
        timeline.moveTo(i, timelineHeight);
        if (steps % stepsPerDisplayText == 0) {
          //TODO: stop using hardcoded heights
          timeline.lineTo(i, timelineHeight - 25);
          this.crc2.fillText(steps.toString(), i - 3, timelineHeight - 28);
          if (Math.round(i) % Math.round(1000 * this.scale.x) == 0)
            this.crc2.fillText((Math.round(100 * (i / 1000 / this.scale.x)) / 100).toString() + "s", i - 3, 10);
        } else {
          timeline.lineTo(i, timelineHeight - 20);
        }
        steps++;
      }
      this.crc2.stroke(timeline);
    }

    drawCursor(_time: number): void {
      let cursor: Path2D = new Path2D();
      cursor.rect(_time - 3, 0, 6, 50);
      cursor.moveTo(_time, 50);
      cursor.lineTo(_time, this.crc2.canvas.height);
      this.crc2.strokeStyle = "red";
      this.crc2.fillStyle = "red";
      this.crc2.stroke(cursor);
      this.crc2.fill(cursor);
    }

    initAnimation(){
      
    }

    private drawEventsLabels(): void {
      let line: Path2D = new Path2D();
      
    }

    private calculateDisplay(_ppS: number): [number, number] {
      // let minPixelPerStep: number = 10;
      // let maxPixelPerStep: number = 50;
      // //TODO: use animation SPS
      // let currentPPS: number = _ppS;
      // while (currentPPS < minPixelPerStep || maxPixelPerStep < currentPPS) {
      //   if(currentPPS < minPixelPerStep) {
      //     currentPPS /= 1.5;
      //   }
      // }
      return [60, 10];
    }
  }
}