namespace Fudge {
  import ƒ = FudgeCore;
  
  export abstract class ViewAnimationSheet {
    public canvas: HTMLCanvasElement;
    public scale: ƒ.Vector2;
    public cameraOffset: ƒ.Vector2 = new ƒ.Vector2(0, -500); // TODO: find out way to do this after dom loaded with height of canvas
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected crc2: CanvasRenderingContext2D;
    private view: ViewAnimation;
    private labels: ViewAnimationLabel[] = [];
    private events: ViewAnimationEvent[] = [];
    private time: number = 0;

    private readonly MAX_SCALE: number = 5;
    private readonly MIN_SCALE: number = 0.00001;
    private readonly SCROLL_SENSITIVITY: number = 0.0005;


    private dragStart: ƒ.Vector2 = new ƒ.Vector2();
    // private scrollPosition: ƒ.Vector2 = new ƒ.Vector2();

    //TODO: stop using hardcoded colors

    constructor(_view: ViewAnimation, _scale: ƒ.Vector2 = new ƒ.Vector2(1, 1)) {
      this.view = _view;
      this.scale = _scale;
      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");

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

    // public moveTo(_time: number, _value: number = this.position.y): void {
    //   this.position.x = _time;
    //   this.position.y = _value;
    // }

    // public translate(): void {
    //   this.crc2.translate(this.position.x, this.position.y);
    //   this.crc2.scale(this.cameraZoom, this.cameraZoom);
    // }

    public redraw(_time?: number): void {
      if (!this.animation) return;
      if (_time != undefined) this.time = _time;
      this.canvas.width = this.dom.clientWidth - this.toolbar.clientWidth;
      this.canvas.height = this.dom.clientHeight;
    
      // this.clear();
      // this.translate();
      // this.crc2.translate(this.position.x, this.position.y);
      // console.log(this.scale.x);
      // this.crc2.translate(this.scrollPosition.x, this.scrollPosition.y);
      this.crc2.scale(this.scale.x, this.scale.y);
      // this.crc2.translate(-this.scrollPosition.x, -this.scrollPosition.y);
      this.crc2.translate(-this.cameraOffset.x, -this.cameraOffset.y);
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
      this.drawKeys();
      this.drawTimeline();
      this.drawEventsAndLabels();
      this.drawCursor(this.time);
    }

    // public clear(): void {
    //   this.crc2.resetTransform();
    //   let maxDistance: number = 10000;
    //   this.crc2.clearRect(0, 0, maxDistance, this.crc2.canvas.height);
    // }

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
      this.crc2.textBaseline = "bottom";
      this.crc2.textAlign = "center";

      const pixelPerSecond: number = 1000;
      const minimumPixelPerStep: number = 10;
      let pixelPerStep: number = (pixelPerSecond / this.animation.fps) * this.scale.x;
      let framesPerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      framesPerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.width / pixelPerStep;
      let scaledOffset: number = this.cameraOffset.x * this.scale.x;
      let stepOffset: number = Math.floor(scaledOffset / pixelPerStep);
      for (let i: number = stepOffset; i < steps + stepOffset; i++) {
        let x: number = (i * pixelPerStep - this.cameraOffset.x * this.scale.x);
        timeline.moveTo(x, timelineHeight);
        // TODO: refine the display
        if (i % 5 == 0) {
          timeline.lineTo(x, timelineHeight - 25);
          let second: number = Math.floor((i * framesPerStep) / this.animation.fps);
          let frame: number = (i * framesPerStep) % this.animation.fps;
          this.crc2.fillText(
            `${second}:${frame < 10 ? "0" : ""}${frame}`, 
            x, 
            timelineHeight - 28);
        } else {
          timeline.lineTo(x, timelineHeight - 20);
        }
      }

      this.crc2.stroke(timeline);
      // this.crc2.translate(-this.scrollPosition.x, -this.scrollPosition.y);
    }

    public drawCursor(_time: number): void {
      let time: number = (_time - this.cameraOffset.x) * this.scale.x;
      let cursor: Path2D = new Path2D();
      // cursor.rect(time - 3, 0, 6, 50);
      cursor.moveTo(time, 0);
      cursor.lineTo(time, this.canvas.height);
      this.crc2.strokeStyle = "red";
      this.crc2.fillStyle = "red";
      this.crc2.stroke(cursor);
      this.crc2.fill(cursor);
    }

    public drawKeys(): void {
      // let inputMutator: ƒ.Mutator = this.view.controller.getElementIndex();
      // let inputMutator: ƒ.Mutator = this.view.controller.getMutator();
      // console.log(inputMutator);

      // this.drawKey(10, 10, 10, 10, "green");

      //TODO: stop recreating the sequence elements all the time
      this.sequences = [];
      this.keys = [];
      // this.traverseStructures(this.view.animation.animationStructure, inputMutator);
      this.traverseStructures(this.animation.animationStructure);
    }

    public getObjectAtPoint(_x: number, _y: number): ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent {
      let x: number = _x / this.scale.x + this.cameraOffset.x;
      let y: number = _y / this.scale.y + this.cameraOffset.y;
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

      for (let k of this.keys) {
        if (this.crc2.isPointInPath(k.path2D, x, y)) {
          return k;
        }
      }
      return null;
    }

    protected traverseStructures(_animation: ƒ.AnimationStructure): void {
      for (let i in _animation) {
        if (_animation[i] instanceof ƒ.AnimationSequence) {
          this.drawSequence(<ƒ.AnimationSequence>_animation[i]);
        } else {
          this.traverseStructures(<ƒ.AnimationStructure>_animation[i]);
        }
      }
    }

    protected abstract drawSequence(_sequence: ƒ.AnimationSequence): void;

    protected drawKey(_x: number, _y: number, _h: number, _w: number, _c: string): Path2D {
      // console.log(`x: ${_x} y: ${_y} h: ${_h} w: ${_w} c: ${_c}`);
      let key: Path2D = new Path2D();
      key.moveTo(_x - _w, _y);
      key.lineTo(_x, _y + _h);
      key.lineTo(_x + _w, _y);
      key.lineTo(_x, _y - _h);
      key.closePath();

      this.crc2.fillStyle = _c;
      this.crc2.strokeStyle = "white";
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
      if (!this.animation) return;
      for (let l in this.animation.labels) {
        //TODO stop using hardcoded values
        let p: Path2D = new Path2D;
        this.labels.push({ label: l, path2D: p });
        let position: number = this.animation.labels[l] * this.scale.x;
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
        let position: number = this.animation.events[e] * this.scale.x;
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
      this.dragStart.x = _event.offsetX / this.scale.x + this.cameraOffset.x;
      this.dragStart.y = _event.offsetY / this.scale.y + this.cameraOffset.y;
    }

    private hndPointerMove = (_event: PointerEvent): void => {
      _event.preventDefault();
      if (_event.buttons != 4) return;
      this.cameraOffset.x = Math.max(this.dragStart.x - _event.offsetX / this.scale.x, 0);
      this.cameraOffset.y = this.dragStart.y - _event.offsetY / this.scale.y;
      this.redraw();
    }

    private hdnWheel = (_event: WheelEvent) => {
      if (_event.buttons != 0) return;

      // this.scrollPosition.x = this.canvas.width / 2 // _event.offsetX;
      // this.scrollPosition.y = this.canvas.height / 2//_event.offsetY;

      let scaleDelta: number = _event.deltaY * this.SCROLL_SENSITIVITY;
      this.scale.x -= scaleDelta * this.scale.x;
      this.scale.x = Math.min( this.scale.x, this.MAX_SCALE );
      this.scale.x = Math.max( this.scale.x, this.MIN_SCALE );

      this.scale.y -= scaleDelta * this.scale.y;
      this.scale.y = Math.min( this.scale.y, this.MAX_SCALE );
      this.scale.y = Math.max( this.scale.y, this.MIN_SCALE );
      
      this.redraw();
    }
  }
}