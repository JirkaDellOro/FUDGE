namespace Fudge {
  export abstract class ViewAnimationSheet {
    view: ViewAnimation;
    seq: FudgeCore.AnimationSequence[];
    crc2: CanvasRenderingContext2D;
    scale: FudgeCore.Vector2;
    protected position: FudgeCore.Vector2;
    protected savedImage: ImageData;
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected labels: ViewAnimationLabel[] = [];
    protected events: ViewAnimationEvent[] = [];

    //TODO stop using hardcoded colors

    constructor(_view: ViewAnimation, _crc: CanvasRenderingContext2D, _seq: FudgeCore.AnimationSequence[], _scale: FudgeCore.Vector2 = new FudgeCore.Vector2(1, 1), _pos: FudgeCore.Vector2 = new FudgeCore.Vector2()) {
      this.view = _view;
      this.crc2 = _crc;
      this.seq = _seq;
      this.scale = _scale;
      this.position = _pos;
    }

    public moveTo(_time: number, _value: number = this.position.y): void {
      this.position.x = _time;
      this.position.y = _value;
    }

    public translate(): void {
      this.crc2.translate(this.position.x, this.position.y);
      this.crc2.scale(this.scale.x, this.scale.y);
    }

    public redraw(_time: number): void {
      this.clear();
      this.translate();
      this.drawKeys();
      this.drawTimeline();
      this.drawEventsAndLabels();
      this.drawCursor(_time);
    }

    public clear(): void {
      this.crc2.resetTransform();
      let maxDistance: number = 10000;
      this.crc2.clearRect(0, 0, maxDistance, this.crc2.canvas.height);
    }

    public drawTimeline(): void {
      this.crc2.resetTransform();
      let timelineHeight: number = 50;
      let maxDistance: number = 10000;
      let timeline: Path2D = new Path2D();
      this.crc2.fillStyle = "#7a7a7a";
      this.crc2.fillRect(0, 0, maxDistance, timelineHeight + 30);
      timeline.moveTo(0, timelineHeight);
      //TODO make this use some actually sensible numbers, maybe 2x the animation length
      timeline.lineTo(maxDistance, timelineHeight);
      //TODO: make this scale nicely/use the animations SPS
      let baseWidth: number = 1000;
      let pixelPerSecond: number = Math.floor(baseWidth * this.scale.x);
      let stepsPerSecond: number = this.view.animation.stepsPerSecond;
      let stepsPerDisplayText: number = 1;
      // [stepsPerSecond, stepsPerDisplayText] = this.calculateDisplay(pixelPerSecond);
      let pixelPerStep: number = pixelPerSecond / stepsPerSecond;
      let steps: number = 0;
      // console.log(pixelPerSecond, pixelPerStep);
      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      for (let i: number = 0; i < maxDistance; i += pixelPerStep) {
        timeline.moveTo(i, timelineHeight);
        if (steps % stepsPerDisplayText == 0) {
          //TODO: stop using hardcoded heights
          timeline.lineTo(i, timelineHeight - 25);
          this.crc2.fillText(steps.toString(), i - 3, timelineHeight - 28);
          if (Math.round(i) % Math.round(1000 * this.scale.x) == 0)
            //TODO: make the time display independent of the SPS display. Trying to tie the two together was a stupid idea.
            this.crc2.fillText((Math.round(100 * (i / 1000 / this.scale.x)) / 100).toString() + "s", i - 3, 10);
        } else {
          timeline.lineTo(i, timelineHeight - 20);
        }
        steps++;
      }
      this.crc2.stroke(timeline);
    }

    public drawCursor(_time: number): void {
      _time *= this.scale.x;
      let cursor: Path2D = new Path2D();
      cursor.rect(_time - 3, 0, 6, 50);
      cursor.moveTo(_time, 50);
      cursor.lineTo(_time, this.crc2.canvas.height);
      this.crc2.strokeStyle = "red";
      this.crc2.fillStyle = "red";
      this.crc2.stroke(cursor);
      this.crc2.fill(cursor);
    }

    public drawKeys(): void {
      let inputMutator: FudgeCore.Mutator = this.view.controller.getElementIndex();

      //TODO: stop recreating the sequence elements all the time
      this.sequences = [];
      this.keys = [];
      this.traverseStructures(this.view.animation.animationStructure, inputMutator);
    }

    public getObjectAtPoint(_x: number, _y: number): ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent {
      for (let l of this.labels) {
        if (this.crc2.isPointInPath(l.path2D, _x, _y)) {
          return l;
        }
      }
      for (let e of this.events) {
        if (this.crc2.isPointInPath(e.path2D, _x, _y)) {
          return e;
        }
      }
      _x = _x / this.scale.x - this.position.x;
      _y = _y / this.scale.y - this.position.y / this.scale.y;
      for (let k of this.keys) {
        if (this.crc2.isPointInPath(k.path2D, _x, _y)) {
          return k;
        }
      }
      return null;
    }

    protected traverseStructures(_animation: FudgeCore.AnimationStructure, _inputs: FudgeCore.Mutator): void {
      for (let i in _animation) {
        if (_animation[i] instanceof FudgeCore.AnimationSequence) {
          this.drawSequence(<FudgeCore.AnimationSequence>_animation[i], <HTMLInputElement>_inputs[i]);
        } else {
          this.traverseStructures(<FudgeCore.AnimationStructure>_animation[i], <FudgeCore.Mutator>_inputs[i]);
        }
      }
    }

    protected abstract drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;


    protected drawKey(_x: number, _y: number, _h: number, _w: number, _c: string): Path2D {
      let key: Path2D = new Path2D();
      key.moveTo(_x - _w, _y);
      key.lineTo(_x, _y + _h);
      key.lineTo(_x + _w, _y);
      key.lineTo(_x, _y - _h);
      key.closePath();

      this.crc2.fillStyle = _c;
      this.crc2.strokeStyle = "black";
      this.crc2.lineWidth = 1;
      this.crc2.fill(key);
      this.crc2.stroke(key);
      return key;
    }

    private drawEventsAndLabels(): void {
      let maxDistance: number = 10000;
      let labelDisplayHeight: number = 30 + 50;
      let line: Path2D = new Path2D();
      line.moveTo(0, labelDisplayHeight);
      line.lineTo(maxDistance, labelDisplayHeight);

      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      this.crc2.stroke(line);

      this.labels = [];
      this.events = [];
      if (!this.view.animation) return;
      for (let l in this.view.animation.labels) {
        //TODO stop using hardcoded values
        let p: Path2D = new Path2D;
        this.labels.push({ label: l, path2D: p });
        let position: number = this.view.animation.labels[l] * this.scale.x;
        p.moveTo(position - 3, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 2);
        p.lineTo(position + 3, labelDisplayHeight - 2);
        p.lineTo(position + 3, labelDisplayHeight - 25);
        p.lineTo(position, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 28);
        this.crc2.fill(p);
        this.crc2.stroke(p);
        let p2: Path2D = new Path2D();
        p2.moveTo(position, labelDisplayHeight - 28);
        p2.lineTo(position, labelDisplayHeight - 25);
        p2.lineTo(position + 3, labelDisplayHeight - 25);
        this.crc2.strokeStyle = "white";
        this.crc2.stroke(p2);
        this.crc2.strokeStyle = "black";
      }
      for (let e in this.view.animation.events) {
        let p: Path2D = new Path2D;
        this.events.push({ event: e, path2D: p });
        let position: number = this.view.animation.events[e] * this.scale.x;
        p.moveTo(position - 3, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 5);
        p.lineTo(position, labelDisplayHeight - 2);
        p.lineTo(position + 3, labelDisplayHeight - 5);
        p.lineTo(position + 3, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 28);
        // this.crc2.fill(p);
        this.crc2.stroke(p);
      }
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