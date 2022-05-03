namespace Fudge {
  import ƒ = FudgeCore;
  
  export abstract class ViewAnimationSheet {
    public canvas: HTMLCanvasElement;
    public scale: ƒ.Vector2;
    public cameraOffset: ƒ.Vector2 = new ƒ.Vector2();
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected crc2: CanvasRenderingContext2D;
    private view: ViewAnimation;
    // private position: ƒ.Vector2; // TODO: is this necessary?
    private labels: ViewAnimationLabel[] = [];
    private events: ViewAnimationEvent[] = [];
    private time: number = 0;

    // public scale = 1;
    private MAX_ZOOM: number = 5;
    private MIN_ZOOM: number = 0.000001;
    private SCROLL_SENSITIVITY: number = 0.0005;

    private isDragging: boolean = false;
    private dragStart: ƒ.Vector2 = new ƒ.Vector2();

    //TODO stop using hardcoded colors

    constructor(_view: ViewAnimation, _scale: ƒ.Vector2 = new ƒ.Vector2(1, 1), _pos: ƒ.Vector2 = new ƒ.Vector2()) {
      this.view = _view;
      this.scale = _scale;
      // this.position = _pos;
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

      // this.crc2.translate( window.innerWidth / 2, window.innerHeight / 2 );
      // this.crc2.scale(this.cameraZoom, this.cameraZoom);
      // this.crc2.translate( -window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y );
      // this.crc2.clearRect(0,0, window.innerWidth, window.innerHeight);

      
      // this.clear();
      // this.translate();
      // this.crc2.translate(this.canvas.height / 2, this.canvas.height / 2);
      // this.crc2.translate(this.position.x, this.position.y);
      // console.log(this.scale.x);
      this.crc2.scale(this.scale.x, this.scale.y);
      this.crc2.translate(-this.cameraOffset.x, this.cameraOffset.y + 200);
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
      this.drawKeys();
      this.drawTimeline();
      this.drawEventsAndLabels();
      this.drawCursor(this.time);
    }

    public clear(): void {
      this.crc2.resetTransform();
      let maxDistance: number = 10000;
      this.crc2.clearRect(0, 0, maxDistance, this.crc2.canvas.height);
    }

    public drawTimeline(): void {
      this.crc2.resetTransform();
      
      let timelineHeight: number = 50;
      this.crc2.fillStyle = "#7a7a7a";
      this.crc2.fillRect(0, 0, this.canvas.width, timelineHeight + 30);
  
      let timeline: Path2D = new Path2D();
      timeline.moveTo(0, timelineHeight);
      timeline.lineTo(this.canvas.width, timelineHeight);
      
      // let baseWidth: number = 1000;


      // let pixelPerSecond: number = Math.round(baseWidth * this.scale.x);
      // // console.log(pixelPerSecond);
      // let stepsPerSecond: number = this.animation.fps; // was stepsPerSecond TODO: find out why... see masterthesis Lukas Scheuerle;
      // // let stepsPerSecond: number = 
      // let stepsPerDisplayText: number = 1;
      // let pixelPerStep: number = pixelPerSecond / this.animation.fps;
      // let steps: number = 0;
      // [pixelPerStep, stepsPerDisplayText] = this.calculateDisplay(pixelPerStep);

      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      this.crc2.textBaseline = "bottom";
      this.crc2.textAlign = "center";
      
      // for (let i: number = this.cameraOffset.x; i < this.canvas.width; i += pixelPerStep) {
      //   timeline.moveTo(i, timelineHeight);
      //   if (steps % stepsPerDisplayText == 0) {
      //     //TODO: stop using hardcoded heights
      //   timeline.lineTo(i, timelineHeight - 25);
      //   this.crc2.fillText(steps.toString(), i - 3, timelineHeight - 28);
      //   if (Math.round(i) % Math.round(baseWidth * this.scale.x) == 0)
      //     //TODO: make the time display independent of the SPS display. Trying to tie the two together was a stupid idea.
      //     this.crc2.fillText((Math.round(100 * (i / 1000 / this.scale.x)) / 100).toString() + "s", i - 3, 10);
      // } 
      // else {
      //   timeline.lineTo(i, timelineHeight - 20);
      //   }
      //   steps++;
      // }

      let stepWidth: number = (1000 / this.animation.fps) * this.scale.x;
      let stepSize: number = 1; // in frame number
      while (stepWidth < 10) {
        stepWidth *= 2;
        stepSize *= 2;
      }
      let ssteps: number = 1 + this.canvas.width / stepWidth;
      let stepOffset: number = Math.floor((this.cameraOffset.x * this.scale.x) / stepWidth);
      let stepCounter: number = 0;
      for (let i: number = stepOffset; i < ssteps + stepOffset; i++) {
        let x: number = (i * stepWidth - (this.cameraOffset.x * this.scale.x));
        timeline.moveTo(x, timelineHeight);
        // TODO: refine the display
        if (i % 5 == 0) {
          timeline.lineTo(x, timelineHeight - 25);
          let second: number = Math.floor((i * stepSize) / this.animation.fps);
          let frame: number = (i * stepSize) % this.animation.fps;
          this.crc2.fillText(
            `${second}:${frame < 10 ? "0" : ""}${frame}`, 
            x, 
            timelineHeight - 28);
        } else {
          timeline.lineTo(x, timelineHeight - 20);
        }
        stepCounter++;
      }


      this.crc2.stroke(timeline);
    }

    public drawCursor(_time: number): void {
      let time: number = (_time - this.cameraOffset.x) * this.scale.x;
      let cursor: Path2D = new Path2D();
      cursor.rect(time - 3, 0, 6, 50);
      cursor.moveTo(time, 50);
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
      // TODO: repair selection
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

      // _x = _x / this.scale.x - this.position.x;
      // _y = _y / this.scale.y - this.position.y / this.scale.y;
      // for (let k of this.keys) {
      //   if (this.crc2.isPointInPath(k.path2D, _x, _y)) {
      //     return k;
      //   }
      // }
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

    private calculateDisplay(_ppS: number): [number, number] {
      let minPixelPerStep: number = 10;
      // let maxPixelPerStep: number = 50;
      //TODO: use animation SPS
      let currentPPS: number = _ppS;
      while (currentPPS < minPixelPerStep ) { //|| currentPPS > maxPixelPerStep
        // if (currentPPS < minPixelPerStep) {
        currentPPS *= 1.5;
        // } else {
        //   currentPPS /= 1.5;
        // }
      }
      return [currentPPS, 10];
    }

    private hndPointerDown = (_event: PointerEvent): void => {
      if (_event.buttons != 4) return;
      this.dragStart.x = _event.offsetX / this.scale.x + this.cameraOffset.x;
      // this.dragStart.y = _event.offsetY / this.scale.y - this.cameraOffset.y;
    }

    private hndPointerMove = (_event: PointerEvent): void => {
      _event.preventDefault();
      if (_event.buttons != 4) return;
      this.cameraOffset.x = Math.max(this.dragStart.x - _event.offsetX / this.scale.x, 0);
      // this.cameraOffset.y = Math.min(_event.offsetY / this.scale.x - this.dragStart.y, 0);
      this.redraw();
    }

    private hdnWheel = (_event: WheelEvent) => {
      let zoomAmount: number = _event.deltaY * this.SCROLL_SENSITIVITY * this.scale.x;

      if (!this.isDragging) {
        if (zoomAmount) {
          this.scale.x -= zoomAmount;
        }

        this.scale.x = Math.min( this.scale.x, this.MAX_ZOOM );
        this.scale.x = Math.max( this.scale.x, this.MIN_ZOOM );
        
        this.redraw();
      }
    }
  }
}