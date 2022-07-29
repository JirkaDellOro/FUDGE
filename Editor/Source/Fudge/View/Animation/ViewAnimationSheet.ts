namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  
  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export abstract class ViewAnimationSheet extends View {
    protected static readonly KEY_SIZE: number = 8; // width and height in px
    private static readonly LINE_WIDTH: number = 1; // in px
    private static readonly TIMELINE_HEIGHT: number = 50; // in px
    private static readonly PIXEL_PER_MILLISECOND: number = 1; // at scaling 1
    private static readonly PIXEL_PER_VALUE: number = 100; // at scaling 1
    private static readonly STANDARD_ANIMATION_LENGTH: number = 1000; // in miliseconds, used when animation length is falsy

    public canvas: HTMLCanvasElement;
    public scrollContainer: HTMLDivElement;
    public scrollBody: HTMLDivElement;
    protected mtxWorldToView: ƒ.Matrix3x3;
    protected mtxViewToWorld: ƒ.Matrix3x3;
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected crc2: CanvasRenderingContext2D;
    private labels: ViewAnimationLabel[] = [];
    private events: ViewAnimationEvent[] = [];
    private playbackTime: number = 0;
    private graph: ƒ.Graph;

    private posDragStart: ƒ.Vector2 = new ƒ.Vector2();
    private animation: ƒ.Animation;

    constructor(_container: ComponentContainer, _state: Object) {
      super(_container, _state);
      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");
      this.mtxWorldToView = new ƒ.Matrix3x3();
      this.mtxViewToWorld = new ƒ.Matrix3x3();

      this.canvas.style.position = "absolute";

      this.scrollContainer = document.createElement("div");
      this.scrollContainer.style.position = "absolute";
      this.scrollContainer.style.width = "100%";
      this.scrollContainer.style.height = "100%";
      this.scrollContainer.style.overflowX = "scroll";
      this.scrollContainer.style.scrollBehavior = "instant";
      this.scrollContainer.addEventListener("pointerdown", this.hndPointerDown);
      this.scrollContainer.addEventListener("pointermove", this.hndPointerMove);
      this.scrollContainer.addEventListener("pointerup", this.hndPointerUp);
      this.scrollContainer.addEventListener("wheel", this.hndWheel);

      _container.on("resize", () => this.redraw());
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.ANIMATE, this.hndAnimate);

      this.scrollBody = document.createElement("div");
      this.scrollBody.style.overflow = "hidden";
      this.scrollBody.style.height = "1px";

      this.dom.appendChild(this.canvas);
      this.dom.appendChild(this.scrollContainer);
      this.scrollContainer.appendChild(this.scrollBody);
    }

    public redraw(_scroll: boolean = true, _time?: number): void {
      this.canvas.width = this.dom.clientWidth;
      this.canvas.height = this.dom.clientHeight;
      
      if (_time != undefined) this.playbackTime = _time;
      
      let translation: ƒ.Vector2 = this.mtxWorldToView.translation;
      translation.x = Math.min(0, translation.x);
      this.mtxWorldToView.translation = translation;
      this.mtxViewToWorld = ƒ.Matrix3x3.INVERSION(this.mtxWorldToView);

      if (_scroll) {
        let timelineLength: number = this.canvas.width * this.mtxViewToWorld.scaling.x + this.mtxViewToWorld.translation.x; // in miliseconds
        let animationLength: number = this.animation?.totalTime || 0;
        if (timelineLength - animationLength > 0) {
          this.scrollBody.style.width = `${this.canvas.width - this.mtxWorldToView.translation.x}px`;
        } else {
          this.scrollBody.style.width = `${animationLength * 1.2 * this.mtxWorldToView.scaling.x}px`;
        }
        this.scrollContainer.scrollLeft = -this.mtxWorldToView.translation.x;
      }

      if (this.animation) {
        this.drawKeys();
        if (this instanceof ViewAnimationSheetCurve) {
          this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH; // * this.mtxTransformInverse.scaling.x;
          this.drawCurves();
          this.drawScale();
        }
        this.drawTimeline();
        this.drawEventsAndLabels();
        this.drawCursor(this.playbackTime);
      }
    }

    protected drawTimeline(): void {
      this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH;
      
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
      let pixelPerFrame: number = 1000 / this.animation.fps;
      let pixelPerStep: number = pixelPerFrame * this.mtxWorldToView.scaling.x;
      let framesPerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      framesPerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.width / pixelPerStep;
      let stepOffset: number = Math.floor(-this.mtxWorldToView.translation.x / pixelPerStep);
      for (let iStep: number = stepOffset; iStep < steps + stepOffset; iStep++) {
        let x: number = (iStep * pixelPerStep + this.mtxWorldToView.translation.x);
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
      let x: number = _time * this.mtxWorldToView.scaling.x + this.mtxWorldToView.translation.x;
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
        let position: number = this.animation.labels[l] * this.mtxWorldToView.scaling.x + this.mtxWorldToView.translation.x;
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
        let position: number = this.animation.events[e] * this.mtxWorldToView.scaling.x + this.mtxWorldToView.translation.x;
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

    private getTransformedPos(_x: number, _y: number): ƒ.Vector2 {
      let vector: ƒ.Vector2 = new ƒ.Vector2(_x, _y);
      vector.transform(this.mtxViewToWorld);
      return vector;
    }

    private hndEvent = (_event: FudgeEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.FOCUS:
          this.graph = _event.detail.graph;
          this.animation = _event.detail.node?.getComponent(ƒ.ComponentAnimator)?.animation;
          this.mtxWorldToView.reset();
          // this.mtxWorldToView.scaleY(-1);
          this.mtxWorldToView.scaleY(-ViewAnimationSheet.PIXEL_PER_VALUE); // flip y
          this.mtxWorldToView.scaleX(ViewAnimationSheet.PIXEL_PER_MILLISECOND);
          this.mtxViewToWorld = ƒ.Matrix3x3.INVERSION(this.mtxWorldToView);
          if (this.animation) {
            this.setTime(0);
            // TODO: adjust y scaling to fit highest and lowest key
            let translation: ƒ.Vector2 = this.mtxWorldToView.translation;
            translation.y = this.canvas.height / 2;
            this.mtxWorldToView.translation = translation;
            let scaling: ƒ.Vector2 = this.mtxWorldToView.scaling;
            scaling.x = this.canvas.width / ((this.animation.totalTime || ViewAnimationSheet.STANDARD_ANIMATION_LENGTH) * 1.2);
            this.mtxWorldToView.scaling = scaling;
          }
          this.redraw();
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
          else {
            let x: number = _event.offsetX;
            let y: number = _event.offsetY;
            const findObject: (_object: ViewAnimationKey | ViewAnimationLabel | ViewAnimationEvent) => boolean = _object => this.crc2.isPointInPath(_object.path2D, x, y);
            let obj: ViewAnimationKey | ViewAnimationLabel | ViewAnimationEvent =
              this.keys.find(findObject) ||
              this.labels.find(findObject) ||
              this.events.find(findObject);

            if (!obj) return;
            if (obj["label"]) {
              console.log(obj["label"]);
              this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: { name: obj["label"], time: this.animation.labels[obj["label"]] } } });
            }
            else if (obj["event"]) {
              console.log(obj["event"]);
              this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: { name: obj["event"], time: this.animation.events[obj["event"]] } } });
            }
            else if (obj["key"]) {
              console.log(obj["key"]);
              this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: obj } });
            }
          }
          break;
        case 4:
          this.posDragStart = this.getTransformedPos(_event.offsetX, _event.offsetY);
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
          this.mtxWorldToView.translate(ƒ.Vector2.DIFFERENCE(this.getTransformedPos(_event.offsetX, _event.offsetY), this.posDragStart));
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
      let posCursorTransformed: ƒ.Vector2 = this.getTransformedPos(_event.offsetX, _event.offsetY);
      
      this.mtxWorldToView.translate(posCursorTransformed);
      this.mtxWorldToView.scale(new ƒ.Vector2(_event.shiftKey ? 1 : zoomFactor, _event.ctrlKey ? 1 : zoomFactor));
      this.mtxWorldToView.translate(ƒ.Vector2.SCALE(posCursorTransformed, -1));

      this.redraw();
    }

    private hndScroll = (_event: Event) => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = this.mtxWorldToView.translation;
      translation.x = -this.scrollContainer.scrollLeft;
      this.mtxWorldToView.translation = translation;
      this.redraw(false);
    }

    private hndAnimate = (_event: FudgeEvent): void => {
      this.playbackTime = _event.detail.data.playbackTime || 0;
      this.sequences = _event.detail.data.sequences || this.sequences;

      this.redraw();
    }

    private setTime(_x: number): void {
      let playbackTime: number = Math.max(0, this.getTransformedPos(_x, 0).x);
      let pixelPerFrame: number = 1000 / this.animation.fps;
      playbackTime = Math.round(playbackTime / pixelPerFrame) * pixelPerFrame;
      this.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph, data: { playbackTime: playbackTime } } });
    }
  }
}
