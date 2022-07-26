namespace Fudge {
  import ƒ = FudgeCore;
  
  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export abstract class ViewAnimationSheet {
    public canvas: HTMLCanvasElement;
    // TODO: move transform to ViewAnimation so it can be shared bewtween Dope and Curve
    public transform: ƒ.Matrix3x3;
    
    protected readonly pixelPerValue: number = 100;
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected crc2: CanvasRenderingContext2D;
    private view: ViewAnimation;
    private labels: ViewAnimationLabel[] = [];
    private events: ViewAnimationEvent[] = [];
    private time: number = 0;

    private posDragStart: ƒ.Vector2 = new ƒ.Vector2();

    constructor(_view: ViewAnimation) {
      this.view = _view;
      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");
      this.transform = new ƒ.Matrix3x3();
      this.transform.translateY(500);

      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";
      this.canvas.style.borderLeft = "1px solid black";
      
      this.canvas.addEventListener("pointerdown", this.hndPointerDown);
      this.canvas.addEventListener("pointermove", this.hndPointerMove);
      this.canvas.addEventListener("wheel", this.hdnWheel);
    }

    protected get animation(): ƒ.Animation {
      return this.view.animation;
    }

    protected get dom(): HTMLElement {
      return this.view.dom;
    }

    protected get toolbar(): HTMLDivElement {
      return this.view.toolbar;
    }

    protected get controller(): ControllerAnimation {
      return this.view.controller;
    }

    public setSequences(_sequences: ViewAnimationSequence[]): void {
      this.sequences = _sequences;
      let keyHeight: number = 20 / this.transform.scaling.y;
      let keyWidth: number = 20 / this.transform.scaling.x;
      this.keys = _sequences.flatMap( (_sequence) => {
        let keys: ViewAnimationKey[] = [];
        for (let i: number = 0; i < _sequence.sequence.length; i++) {
          let key: ƒ.AnimationKey = _sequence.sequence.getKey(i);
          keys.push({
            key: key,
            path2D: this.generateKeyPath(
              key.Time,
              -key.Value * this.pixelPerValue,
              keyHeight / 2,
              keyWidth / 2
            ),
            sequence: _sequence
          });
        }
        return keys;
      });
    }

    public redraw(_time?: number): void {
      if (!this.animation) return;
      if (_time != undefined) this.time = _time;
      this.canvas.width = this.dom.clientWidth - this.toolbar.clientWidth;
      this.canvas.height = this.dom.clientHeight;
    
      // TODO: check if these 2 lines are necessary
      this.crc2.resetTransform();
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);

      let translation: ƒ.Vector2 = this.transform.translation;
      translation.x = Math.min(0, translation.x);
      this.transform.translation = translation;
      this.crc2.setTransform(this.transform.scaling.x, 0, 0, this.transform.scaling.y, this.transform.translation.x, this.transform.translation.y);
      
      this.drawKeys(this.keys);
      if (this instanceof ViewAnimationSheetCurve)
        this.drawCurves(this.sequences);
      this.drawTimeline();
      this.drawEventsAndLabels();
      this.drawCursor(this.time);
    }

    public drawTimeline(): void {
      this.crc2.resetTransform();
      this.crc2.lineWidth = 1;
      
      let timelineHeight: number = 50;
      this.crc2.fillStyle = "#7a7a7a";
      this.crc2.fillRect(0, 0, this.canvas.width, timelineHeight + 30);
  
      let timeline: Path2D = new Path2D();
      timeline.moveTo(0, timelineHeight);
      timeline.lineTo(this.canvas.width, timelineHeight);

      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      this.crc2.textBaseline = "middle";
      this.crc2.textAlign = "left";

      const pixelPerSecond: number = 1000;
      const minimumPixelPerStep: number = 10;
      let pixelPerStep: number = (pixelPerSecond / this.animation.fps) * this.transform.scaling.x;
      let framesPerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      framesPerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.width / pixelPerStep;
      let stepOffset: number = Math.floor(-this.transform.translation.x / pixelPerStep);
      for (let iStep: number = stepOffset; iStep < steps + stepOffset; iStep++) {
        let x: number = (iStep * pixelPerStep + this.transform.translation.x);
        timeline.moveTo(x, timelineHeight);
        // TODO: refine the display
        if (iStep % 5 == 0) {
          timeline.lineTo(x, timelineHeight - 30);
          let second: number = Math.floor((iStep * framesPerStep) / this.animation.fps);
          let frame: number = (iStep * framesPerStep) % this.animation.fps;
          this.crc2.fillText(
            `${second}:${frame < 10 ? "0" : ""}${frame}`, 
            x + 3, 
            timelineHeight - 30);
        } else {
          timeline.lineTo(x, timelineHeight - 20);
        }
      }

      this.crc2.stroke(timeline);
    }

    public drawCursor(_time: number): void {
      let x: number = _time * this.transform.scaling.x + this.transform.translation.x;
      let cursor: Path2D = new Path2D();
      cursor.moveTo(x, 0);
      cursor.lineTo(x, this.canvas.height);
      this.crc2.strokeStyle = "red";
      this.crc2.fillStyle = "red";
      this.crc2.stroke(cursor);
      this.crc2.fill(cursor);
    }

    public drawKeys(_keys: ViewAnimationKey[]): void {
      if (_keys.length == 0) return;

      for (const key of _keys) {
        this.drawKey(key);
      }
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

      let point: ƒ.Vector2 = this.getTransformedPoint(_x, _y);
      for (let k of this.keys) {
        if (this.crc2.isPointInPath(k.path2D, point.x, point.y)) {
          return k;
        }
      }
      return null;
    }

    public getTransformedPoint(_x: number, _y: number): ƒ.Vector2 {
      // TODO: use inverse matrix?
      // ƒ.Matrix4x4.INVERSION
      let vector: ƒ.Vector2 = new ƒ.Vector2(_x, _y);
      vector.x = _x / this.transform.scaling.x - this.transform.translation.x / this.transform.scaling.x;
      vector.y = _y / this.transform.scaling.y - this.transform.translation.y / this.transform.scaling.y;

      return vector;
    }

    // protected drawStructure(_animationStructure: ƒ.AnimationStructure): void {
    //   for (const property in _animationStructure) {
    //     let structureOrSequence: ƒ.AnimationStructure | ƒ.AnimationSequence = _animationStructure[property];
    //     if (structureOrSequence instanceof ƒ.AnimationSequence) {
    //       this.drawSequence(structureOrSequence);
    //     } else {
    //       this.drawStructure(structureOrSequence);
    //     }
    //   }
    // }

    protected abstract drawSequence(_sequence: ƒ.AnimationSequence, _color: string): void;



    protected drawKey(_key: ViewAnimationKey): void {
      let color: string = _key.sequence.color;
      let path: Path2D = _key.path2D;
      this.crc2.fillStyle = color;
      this.crc2.strokeStyle = color;
      this.crc2.lineWidth = 1;
      this.crc2.fill(path);
      this.crc2.stroke(path);
    }

    private generateKeyPath(_x: number, _y: number, _h: number, _w: number): Path2D {
      let key: Path2D = new Path2D();
      key.moveTo(_x - _w, _y);
      key.lineTo(_x, _y + _h);
      key.lineTo(_x + _w, _y);
      key.lineTo(_x, _y - _h);
      key.closePath();
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
      if (!this.animation) return;
      for (let l in this.animation.labels) {
        //TODO stop using hardcoded values
        let p: Path2D = new Path2D;
        this.labels.push({ label: l, path2D: p });
        let position: number = this.animation.labels[l] * this.transform.scaling.x;
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
      for (let e in this.animation.events) {
        let p: Path2D = new Path2D;
        this.events.push({ event: e, path2D: p });
        let position: number = this.animation.events[e] * this.transform.scaling.x;
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

    private hndPointerDown = (_event: PointerEvent): void => {
      if (_event.buttons != 4) return;
      this.posDragStart = this.getTransformedPoint(_event.offsetX, _event.offsetY);
    }

    private hndPointerMove = (_event: PointerEvent): void => {
      if (_event.buttons != 4) return;

      _event.preventDefault();
      this.transform.translate(ƒ.Vector2.DIFFERENCE(this.getTransformedPoint(_event.offsetX, _event.offsetY), this.posDragStart));
      this.redraw();
    }

    private hdnWheel = (_event: WheelEvent) => {
      if (_event.buttons != 0) return;
      let zoomFactor: number = _event.deltaY < 0 ? 1.05 : 0.95;
      let posCursorTransformed: ƒ.Vector2 = this.getTransformedPoint(_event.offsetX, _event.offsetY);
      
      this.transform.translate(posCursorTransformed);
      this.transform.scale(new ƒ.Vector2(zoomFactor, _event.ctrlKey ? 1 : zoomFactor));
      this.transform.translate(ƒ.Vector2.SCALE(posCursorTransformed, -1));

      this.redraw();
    }

  }
}