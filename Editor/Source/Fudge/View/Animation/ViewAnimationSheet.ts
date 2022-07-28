namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  
  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export abstract class ViewAnimationSheet {
    protected static readonly KEY_SIZE: number = 8; // width and height in px
    private static readonly LINE_WIDTH: number = 1; // in px
    private static readonly TIMELINE_HEIGHT: number = 50; // in px
    private static readonly PIXEL_PER_SECOND: number = 1000; // at scaling 1

    public canvas: HTMLCanvasElement;
    public scrollContainer: HTMLDivElement;
    public scrollBody: HTMLDivElement;
    protected mtxTransform: ƒ.Matrix3x3;
    protected mtxTransformInverse: ƒ.Matrix3x3;
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected crc2: CanvasRenderingContext2D;
    private view: ViewAnimation;
    private labels: ViewAnimationLabel[] = [];
    private events: ViewAnimationEvent[] = [];
    private playbackTime: number = 0;

    private posDragStart: ƒ.Vector2 = new ƒ.Vector2();
    private animation: ƒ.Animation;

    constructor(_view: ViewAnimation) {
      this.view = _view;
      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");
      this.mtxTransform = new ƒ.Matrix3x3();
      this.mtxTransformInverse = ƒ.Matrix3x3.INVERSION(this.mtxTransform);

      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";
      this.canvas.style.pointerEvents = "auto";

      this.scrollContainer = document.createElement("div");
      this.scrollContainer.style.position = "absolute";
      this.scrollContainer.style.left = "300px";
      this.scrollContainer.style.top = "0px";
      this.scrollContainer.style.overflowX = "scroll";
      this.scrollContainer.style.scrollBehavior = "instant";

      this.scrollContainer.addEventListener("pointerdown", this.hndPointerDown);
      this.scrollContainer.addEventListener("pointermove", this.hndPointerMove);
      this.scrollContainer.addEventListener("pointerup", this.hndPointerUp);
      this.scrollContainer.addEventListener("wheel", this.hndWheel);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.ANIMATE, this.hndAnimate);

      this.scrollBody = document.createElement("div");
      this.scrollBody.style.overflow = "hidden";
      this.scrollBody.style.height = "1px";
    }

    protected get dom(): HTMLElement {
      return this.view.dom;
    }

    protected get controller(): ControllerAnimation {
      return this.view.controller;
    }

    public setSequences(_sequences: ViewAnimationSequence[]): void {
      this.sequences = _sequences;
    }

    public redraw(_scroll: boolean = true, _time?: number): void {
      if (!this.animation) return;
      if (_time != undefined) this.playbackTime = _time;
      this.canvas.width = this.dom.clientWidth - 300;
      this.canvas.height = this.dom.clientHeight - 20;
      this.scrollContainer.style.width = `${this.canvas.width}px`;
      this.scrollContainer.style.height = `${this.canvas.height}px`;
      
      // TODO: check if these 2 lines are necessary
      this.crc2.resetTransform();
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
      
      let translation: ƒ.Vector2 = this.mtxTransform.translation;
      translation.x = Math.min(0, translation.x);
      this.mtxTransform.translation = translation;
      this.crc2.setTransform(this.mtxTransform.scaling.x, 0, 0, this.mtxTransform.scaling.y, this.mtxTransform.translation.x, this.mtxTransform.translation.y);
      this.mtxTransformInverse = ƒ.Matrix3x3.INVERSION(this.mtxTransform);

      if (_scroll) {
        let timelineLength: number = this.canvas.width * this.mtxTransformInverse.scaling.x + this.mtxTransformInverse.translation.x; // in miliseconds
        if (timelineLength - this.animation.totalTime > 0) {
          this.scrollBody.style.width = `${this.canvas.width - this.mtxTransform.translation.x}px`;
        } else {
          this.scrollBody.style.width = `${this.animation.totalTime * this.mtxTransform.scaling.x}px`;
        }
        this.scrollContainer.scrollLeft = -this.mtxTransform.translation.x;
      }

      this.drawKeys();
      if (this instanceof ViewAnimationSheetCurve) {
        this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH * this.mtxTransformInverse.scaling.x;
        this.drawCurves();
        this.drawScale();
      }
      this.drawTimeline();
      this.drawEventsAndLabels();
      this.drawCursor(this.playbackTime);
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
      let vector: ƒ.Vector2 = new ƒ.Vector2(_x, _y);
      vector.transform(this.mtxTransformInverse);

      return vector;
    }

    protected drawTimeline(): void {
      this.crc2.resetTransform();
      this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH;
      
      // let timelineHeight: number = 50;
      this.crc2.fillStyle = "#7a7a7a";
      this.crc2.fillRect(0, 0, this.canvas.width, ViewAnimationSheet.TIMELINE_HEIGHT + 30);
  
      let timeline: Path2D = new Path2D();
      timeline.moveTo(0, ViewAnimationSheet.TIMELINE_HEIGHT);
      timeline.lineTo(this.canvas.width, ViewAnimationSheet.TIMELINE_HEIGHT);

      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      this.crc2.textBaseline = "middle";
      this.crc2.textAlign = "left";

      const minimumPixelPerStep: number = 10;
      let pixelPerStep: number = (ViewAnimationSheet.PIXEL_PER_SECOND / this.animation.fps) * this.mtxTransform.scaling.x;
      let framesPerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      framesPerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.width / pixelPerStep;
      let stepOffset: number = Math.floor(-this.mtxTransform.translation.x / pixelPerStep);
      for (let iStep: number = stepOffset; iStep < steps + stepOffset; iStep++) {
        let x: number = (iStep * pixelPerStep + this.mtxTransform.translation.x);
        timeline.moveTo(x, ViewAnimationSheet.TIMELINE_HEIGHT);
        // TODO: refine the display
        if (iStep % 5 == 0) {
          timeline.lineTo(x, ViewAnimationSheet.TIMELINE_HEIGHT - 30);
          let second: number = Math.floor((iStep * framesPerStep) / this.animation.fps);
          let frame: number = (iStep * framesPerStep) % this.animation.fps;
          this.crc2.fillText(
            `${second}:${frame < 10 ? "0" : ""}${frame}`, 
            x + 3, 
            ViewAnimationSheet.TIMELINE_HEIGHT - 30);
        } else {
          timeline.lineTo(x, ViewAnimationSheet.TIMELINE_HEIGHT - 20);
        }
      }

      this.crc2.stroke(timeline);
    }

    protected drawKeys(): void {
      this.generateKeys();
      
      for (const key of this.keys) {
        this.crc2.fillStyle = key.sequence.color;
        this.crc2.fill(key.path2D);
      }
    }

    protected abstract generateKeys(): void;

    protected generateKey(_x: number, _y: number, _w: number, _h: number): Path2D {
      let key: Path2D = new Path2D();
      key.moveTo(_x - _w, _y);
      key.lineTo(_x, _y + _h);
      key.lineTo(_x + _w, _y);
      key.lineTo(_x, _y - _h);
      key.closePath();
      return key;
    }

    private drawCursor(_time: number): void {
      let x: number = _time * this.mtxTransform.scaling.x + this.mtxTransform.translation.x;
      let cursor: Path2D = new Path2D();
      cursor.moveTo(x, 0);
      cursor.lineTo(x, this.canvas.height);
      this.crc2.strokeStyle = "white";
      this.crc2.stroke(cursor);
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
        let position: number = this.animation.labels[l] * this.mtxTransform.scaling.x + this.mtxTransform.translation.x;
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
        let position: number = this.animation.events[e] * this.mtxTransform.scaling.x + this.mtxTransform.translation.x;
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

    private hndEvent = (_event: FudgeEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.FOCUS:
          this.animation = _event.detail.node?.getComponent(ƒ.ComponentAnimator)?.animation;
          if (this.animation) {
            this.redraw();
            let translation: ƒ.Vector2 = this.mtxTransform.translation;
            translation.y = this.canvas.height / 2;
            this.mtxTransform.translation = translation;
            let scaling: ƒ.Vector2 = this.mtxTransform.scaling;
            scaling.x = this.canvas.width / (this.animation.totalTime * 1.1);
            this.mtxTransform.scaling = scaling;
          }
          break;
      }
    }

    private hndPointerDown = (_event: PointerEvent): void => {
      _event.preventDefault();
      switch (_event.buttons) {
        case 1:
          if (_event.offsetY > (<HTMLElement>_event.target).clientHeight) // clicked on scroll bar
            this.scrollContainer.onscroll = this.hndScroll;
          else if (_event.offsetY <= ViewAnimationSheet.TIMELINE_HEIGHT)
            this.setTime(_event.offsetX);
          break;
        case 4:
          this.posDragStart = this.getTransformedPoint(_event.offsetX, _event.offsetY);
          break;
      }
    }

    private hndPointerMove = (_event: PointerEvent): void => {
      _event.preventDefault();
      switch (_event.buttons) {
        case 1:
          if (_event.offsetY <= ViewAnimationSheet.TIMELINE_HEIGHT)
            this.setTime(_event.offsetX);
          break;
        case 4:
          this.mtxTransform.translate(ƒ.Vector2.DIFFERENCE(this.getTransformedPoint(_event.offsetX, _event.offsetY), this.posDragStart));
          this.redraw();
          break;
      }
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      _event.preventDefault();

      if (this.scrollContainer.onscroll) {
        this.scrollContainer.onscroll = undefined;
        this.redraw();
      }
    }

    private hndWheel = (_event: WheelEvent) => {
      _event.preventDefault();
      if (_event.buttons != 0) return;
      let zoomFactor: number = _event.deltaY < 0 ? 1.05 : 0.95;
      let posCursorTransformed: ƒ.Vector2 = this.getTransformedPoint(_event.offsetX, _event.offsetY);
      
      this.mtxTransform.translate(posCursorTransformed);
      this.mtxTransform.scale(new ƒ.Vector2(_event.shiftKey ? 1 : zoomFactor, _event.ctrlKey ? 1 : zoomFactor));
      this.mtxTransform.translate(ƒ.Vector2.SCALE(posCursorTransformed, -1));

      this.redraw();
    }

    private hndScroll = (_event: Event) => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = this.mtxTransform.translation;
      translation.x = -this.scrollContainer.scrollLeft;
      this.mtxTransform.translation = translation;
      this.redraw(false);
    }

    private hndAnimate = (_event: FudgeEvent): void => {
      this.playbackTime = _event.detail.data.playbackTime || 0;
      this.sequences = _event.detail.data.sequences || this.sequences;

      this.redraw();
    }

    private setTime(_x: number): void {
      let playbackTime: number = Math.max(0, this.getTransformedPoint(_x, 0).x);
      playbackTime = Math.round(playbackTime / ((1000 / this.animation.fps))) * ((1000 / this.animation.fps));
      this.view.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.view.graph, data: { playbackTime: playbackTime } } });
    }
  }
}