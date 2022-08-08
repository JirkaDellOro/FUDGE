namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
 
  enum SHEET_MODE {
    DOPE = "Dopesheet",
    CURVES = "Curves"
  }

  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimationSheet extends View {
    private static readonly KEY_SIZE: number = 6; // width and height in px
    private static readonly LINE_WIDTH: number = 1; // in px
    private static readonly TIMELINE_HEIGHT: number = 80; // in px
    private static readonly SCALE_WIDTH: number = 40; // in px
    private static readonly PIXEL_PER_MILLISECOND: number = 1; // at scaling 1
    private static readonly PIXEL_PER_VALUE: number = 100; // at scaling 1
    private static readonly MINIMUM_PIXEL_PER_STEP: number = 30;
    private static readonly STANDARD_ANIMATION_LENGTH: number = 1000; // in miliseconds, used when animation length is falsy
    
    #mode: SHEET_MODE;

    private graph: ƒ.Graph;
    private animation: ƒ.Animation;
    private playbackTime: number = 0;
    
    private canvas: HTMLCanvasElement = document.createElement("canvas");
    private crc2: CanvasRenderingContext2D = this.canvas.getContext("2d");
    private scrollContainer: HTMLDivElement = document.createElement("div");
    private scrollBody: HTMLDivElement = document.createElement("div");
    private mtxWorldToScreen: ƒ.Matrix3x3 = new ƒ.Matrix3x3();
    private mtxScreenToWorld: ƒ.Matrix3x3 = new ƒ.Matrix3x3();
    
    private selectedKey: ViewAnimationKey;
    private keys: ViewAnimationKey[] = [];
    private sequences: ViewAnimationSequence[] = [];
    private labels: ViewAnimationLabel[] = [];
    private events: ViewAnimationEvent[] = [];
    private slopeHooks: Path2D[] = [];

    private documentStyle: CSSStyleDeclaration = window.getComputedStyle(document.documentElement);
    
    private posDragStart: ƒ.Vector2 = new ƒ.Vector2();
    
    constructor(_container: ComponentContainer, _state: Object) {
      super(_container, _state);

      this.dom.style.position = "absolute";
      this.dom.style.inset = "0";
      this.dom.style.display = "block";
      this.dom.style.height = "auto";
      this.dom.style.padding = "0";
      this.dom.style.margin = "0.5em";

      this.mode = SHEET_MODE.DOPE;

      _container.on("resize", () => this.draw());
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndFocus);
      this.dom.addEventListener(EVENT_EDITOR.ANIMATE, this.hndAnimate);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndSelect);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);

      this.canvas.style.position = "absolute";
      this.dom.appendChild(this.canvas);

      this.scrollContainer.style.position = "relative";
      this.scrollContainer.style.height = "100%";
      this.scrollContainer.style.overflowX = "scroll";
      this.scrollContainer.style.scrollBehavior = "instant";
      this.scrollContainer.addEventListener("pointerdown", this.hndPointerDown);
      this.scrollContainer.addEventListener("pointerup", this.hndPointerUp);
      this.scrollContainer.addEventListener("pointerleave", this.hndPointerUp);
      this.scrollContainer.addEventListener("wheel", this.hndWheel);
      this.dom.appendChild(this.scrollContainer);

      this.scrollBody.style.height = "1px";
      this.scrollContainer.appendChild(this.scrollBody);
    }

    private get mode(): SHEET_MODE {
      return this.#mode;
    }

    private set mode(_mode: SHEET_MODE) {
      this.#mode = _mode;
      this.setTitle(_mode);
      this.contextMenu.items.forEach( _item => _item.enabled = true);
      this.contextMenu.items.find( _item => _item.label == _mode).enabled = false;
      this.resetView();
      this.draw();
    }

    //#region context menu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();

      let item: Electron.MenuItem;
      item = new remote.MenuItem({ label: SHEET_MODE.DOPE, click: () => this.mode = SHEET_MODE.DOPE});
      menu.append(item);
      item = new remote.MenuItem({ label: SHEET_MODE.CURVES, click: () => this.mode = SHEET_MODE.CURVES});
      menu.append(item);
      item = new remote.MenuItem({ label: "Delete Key", click: () => this.dispatch(EVENT_EDITOR.DELETE, { bubbles: true }) });
      menu.append(item);

      return menu;
    }
    //#endregion

    //#region drawing
    private draw(_scroll: boolean = true, _time?: number): void {
      this.canvas.width = this.dom.clientWidth;
      this.canvas.height = this.dom.clientHeight;
      
      if (_time != undefined) this.playbackTime = _time;
      
      let translation: ƒ.Vector2 = this.mtxWorldToScreen.translation;
      translation.x = Math.min(0, translation.x);
      this.mtxWorldToScreen.translation = translation;
      this.mtxScreenToWorld = ƒ.Matrix3x3.INVERSION(this.mtxWorldToScreen);

      if (_scroll) {
        let timelineLength: number = this.canvas.width * this.mtxScreenToWorld.scaling.x + this.mtxScreenToWorld.translation.x; // in miliseconds
        let animationLength: number = this.animation?.totalTime || 0;
        if (timelineLength - animationLength > 0) {
          this.scrollBody.style.width = `${this.canvas.width - this.mtxWorldToScreen.translation.x}px`;
        } else {
          this.scrollBody.style.width = `${animationLength * 1.2 * this.mtxWorldToScreen.scaling.x}px`;
        }
        this.scrollContainer.scrollLeft = -this.mtxWorldToScreen.translation.x;
      }

      if (this.animation) {
        if (this.mode == SHEET_MODE.CURVES)
          this.drawScale();
        this.mtxWorldToScreen.translateX(ViewAnimationSheet.SCALE_WIDTH);
        this.mtxScreenToWorld = ƒ.Matrix3x3.INVERSION(this.mtxWorldToScreen);
        if (this.mode == SHEET_MODE.CURVES)
          this.drawCurves();
        this.drawKeys();
        this.drawTimeline();
        this.drawEventsAndLabels();
        this.drawCursor();
        this.mtxWorldToScreen.translateX(-ViewAnimationSheet.SCALE_WIDTH);
      }
    }

    private drawTimeline(): void {
      this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH;

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-background-content");
      this.crc2.fillRect(0, 0, this.canvas.width, ViewAnimationSheet.TIMELINE_HEIGHT);

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-background-main");
      let animationWidth: number = this.animation.totalTime * this.mtxWorldToScreen.scaling.x;
      let animationStart: number = Math.min(...this.keys.map( _key => _key.key.Time )) * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x;
      this.crc2.fillRect(animationStart, 0, animationWidth, ViewAnimationSheet.TIMELINE_HEIGHT);
      
      let timeline: Path2D = new Path2D();
      timeline.moveTo(0, ViewAnimationSheet.TIMELINE_HEIGHT - 30);
      timeline.lineTo(this.canvas.width, ViewAnimationSheet.TIMELINE_HEIGHT - 30);

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.textBaseline = "middle";
      this.crc2.textAlign = "left";

      const minimumPixelPerStep: number = 10;
      let pixelPerFrame: number = 1000 / this.animation.fps;
      let pixelPerStep: number = pixelPerFrame * this.mtxWorldToScreen.scaling.x;
      let framesPerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(minimumPixelPerStep / pixelPerStep))), 
        1);
      pixelPerStep *= stepScaleFactor;
      framesPerStep *= stepScaleFactor;

      let steps: number = 1 + this.canvas.width / pixelPerStep;
      let stepOffset: number = Math.floor(-this.mtxWorldToScreen.translation.x / pixelPerStep);
      for (let iStep: number = stepOffset; iStep < steps + stepOffset; iStep++) {
        let x: number = (iStep * pixelPerStep + this.mtxWorldToScreen.translation.x);
        timeline.moveTo(x, ViewAnimationSheet.TIMELINE_HEIGHT - 30);
        // TODO: refine the display
        if (iStep % 5 == 0) {
          timeline.lineTo(x, ViewAnimationSheet.TIMELINE_HEIGHT - 60);
          let second: number = Math.floor((iStep * framesPerStep) / this.animation.fps);
          let frame: number = (iStep * framesPerStep) % this.animation.fps;
          this.crc2.fillText(
            `${second}:${frame < 10 ? "0" : ""}${frame}`, 
            x + 3, 
            ViewAnimationSheet.TIMELINE_HEIGHT - 60);
        } else {
          timeline.lineTo(x, ViewAnimationSheet.TIMELINE_HEIGHT - 50);
        }
      }

      this.crc2.stroke(timeline);
    }

    private drawKeys(): void {
      this.keys = this.sequences.flatMap( (_sequence, _iSeqeunce) => 
        _sequence.sequence.getKeys().map( (_key) => {
          let position: ƒ.Vector2 = ƒ.Recycler.get(ƒ.Vector2);
          if (this.mode == SHEET_MODE.CURVES)
            position.set(_key.Time, _key.Value);
          else
            position.set(_key.Time, (_iSeqeunce) * ViewAnimationSheet.KEY_SIZE * 2);
          position.transform(this.mtxWorldToScreen);

          let keyView: ViewAnimationKey = {
            key: _key,
            posScreen: position,
            path2D: generateKey(
              position.x,
              position.y,
              ViewAnimationSheet.KEY_SIZE,
              ViewAnimationSheet.KEY_SIZE
            ),
            sequence: _sequence
          };
          ƒ.Recycler.store(ƒ.Vector2);
          return keyView;
        })
      );
      
      for (const key of this.keys) {
        this.crc2.lineWidth = 4;
        this.crc2.strokeStyle = key.key == this.selectedKey?.key ? 
          this.documentStyle.getPropertyValue("--color-signal") : 
          this.documentStyle.getPropertyValue("--color-dragdrop-outline");
        this.crc2.fillStyle = key.sequence.color;

        this.crc2.stroke(key.path2D);
        this.crc2.fill(key.path2D);

        if (this.mode == SHEET_MODE.CURVES && key.key == this.selectedKey?.key) {
          this.crc2.lineWidth = ViewAnimationSheet.LINE_WIDTH;
          this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-dragdrop-outline");
          this.crc2.fillStyle = this.crc2.strokeStyle;

          let [left, right] = [ƒ.Recycler.get(ƒ.Vector2), ƒ.Recycler.get(ƒ.Vector2)];
          left.set(-50, 0);
          right.set(50, 0);

          let angleSlopeScreen: number = Math.atan(key.key.SlopeIn * (this.mtxWorldToScreen.scaling.y / this.mtxWorldToScreen.scaling.x)) * (180 / Math.PI); // in degree
          let mtxTransform: ƒ.Matrix3x3 = ƒ.Matrix3x3.IDENTITY();
          mtxTransform.translate(key.posScreen);
          mtxTransform.rotate(angleSlopeScreen);
          left.transform(mtxTransform);
          right.transform(mtxTransform);

          let path: Path2D = new Path2D();
          path.moveTo(left.x, left.y);
          path.lineTo(right.x, right.y);
          this.crc2.stroke(path);
          this.slopeHooks = [generateKey(left.x, left.y, 5, 5), generateKey(right.x, right.y, 5, 5)];
          this.slopeHooks.forEach( _hook => this.crc2.fill(_hook) );

          ƒ.Recycler.store(left);
          ƒ.Recycler.store(right);
        }
      }

      function generateKey(_x: number, _y: number, _w: number, _h: number): Path2D {
        let key: Path2D = new Path2D();
        key.moveTo(_x - _w, _y);
        key.lineTo(_x, _y + _h);
        key.lineTo(_x + _w, _y);
        key.lineTo(_x, _y - _h);
        key.closePath();
        return key;
      }
    }

    private drawCurves(): void {
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

    private drawScale(): void {
      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-highlight");
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-highlight");

      let centerLine: Path2D = new Path2D();
      centerLine.moveTo(0, this.mtxWorldToScreen.translation.y);
      centerLine.lineTo(this.canvas.width, this.mtxWorldToScreen.translation.y);
      this.crc2.stroke(centerLine);

      this.crc2.textBaseline = "bottom";
      this.crc2.textAlign = "right";

      let pixelPerStep: number = -this.mtxWorldToScreen.scaling.y;
      let valuePerStep: number = 1;
      let stepScaleFactor: number = Math.max(
        Math.pow(2, Math.ceil(Math.log2(ViewAnimationSheet.MINIMUM_PIXEL_PER_STEP / pixelPerStep))), 
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
          stepLine.lineTo(ViewAnimationSheet.SCALE_WIDTH - 5, y);
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

    private drawCursor(): void {
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-signal");
      let x: number = this.playbackTime * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x;
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

      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.stroke(line);

      this.labels = [];
      this.events = [];
      if (!this.animation) return;
      for (let l in this.animation.labels) {
        //TODO stop using hardcoded values
        let p: Path2D = new Path2D;
        this.labels.push({ label: l, path2D: p });
        let position: number = this.animation.labels[l] * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x;
        p.moveTo(position - 3, labelDisplayHeight - 26);
        p.lineTo(position - 3, labelDisplayHeight - 4);
        p.lineTo(position + 3, labelDisplayHeight - 4);
        p.lineTo(position + 3, labelDisplayHeight - 23);
        p.lineTo(position, labelDisplayHeight - 26);
        p.lineTo(position - 3, labelDisplayHeight - 26);
        this.crc2.fill(p);
        this.crc2.stroke(p);
        let p2: Path2D = new Path2D();
        p2.moveTo(position, labelDisplayHeight - 26);
        p2.lineTo(position, labelDisplayHeight - 23);
        p2.lineTo(position + 3, labelDisplayHeight - 23);
        this.crc2.stroke(p2);
      }
      for (let e in this.animation.events) {
        let p: Path2D = new Path2D;
        this.events.push({ event: e, path2D: p });
        let position: number = this.animation.events[e] * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x;
        p.moveTo(position - 3, labelDisplayHeight - 26);
        p.lineTo(position - 3, labelDisplayHeight - 7);
        p.lineTo(position, labelDisplayHeight - 4);
        p.lineTo(position + 3, labelDisplayHeight - 7);
        p.lineTo(position + 3, labelDisplayHeight - 26);
        p.lineTo(position - 3, labelDisplayHeight - 26);
        // this.crc2.fill(p);
        this.crc2.stroke(p);
      }
    }
    //#endregion

    //#region event handling
    private hndFocus = (_event: FudgeEvent): void => {
      this.graph = _event.detail.graph;
      this.animation = _event.detail.node?.getComponent(ƒ.ComponentAnimator)?.animation;
      this.resetView();
      this.draw();
    }

    private hndAnimate = (_event: FudgeEvent): void => {
      this.playbackTime = _event.detail.data.playbackTime;
      if (_event.detail.data.sequences)
        this.sequences = _event.detail.data.sequences;
      
      this.draw();
    }

    private hndSelect = (_event: FudgeEvent): void => {
      this.selectedKey = null;
      if (_event.detail.data && "key" in _event.detail.data) {
        this.selectedKey = _event.detail.data;
      }
      this.draw(false);
    }

    private hndPointerDown = (_event: PointerEvent): void => {
      _event.preventDefault();
      switch (_event.buttons) {
        case 1:
          if (_event.offsetY > (<HTMLElement>_event.target).clientHeight) // clicked on scroll bar
            this.scrollContainer.onscroll = this.hndScroll;
          else if (_event.offsetY <= ViewAnimationSheet.TIMELINE_HEIGHT - 30) {
            this.hndPointerMoveTimeline(_event);
            this.scrollContainer.onpointermove = this.hndPointerMoveTimeline;
          }
          else if (this.slopeHooks.some(_hook => this.crc2.isPointInPath(_hook, _event.offsetX, _event.offsetY))) {
            this.scrollContainer.onpointermove = this.hndPointerMoveSlope;
          } else {
            let x: number = _event.offsetX;
            let y: number = _event.offsetY;
            const findObject: (_object: ViewAnimationKey | ViewAnimationLabel | ViewAnimationEvent) => boolean = _object => this.crc2.isPointInPath(_object.path2D, x, y);
            let obj: ViewAnimationKey | ViewAnimationLabel | ViewAnimationEvent =
              this.keys.find(findObject) ||
              this.labels.find(findObject) ||
              this.events.find(findObject);

            if (!obj) {
              this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: null } });
              return;
            } 

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
        case 2: 
          this.contextMenu.items.find( _item => _item.label == "Delete Key").enabled = this.selectedKey != null;
          break;
        case 4:
          this.scrollContainer.onpointermove = this.hndPointerMovePan;
          this.posDragStart = this.getScreenToWorldPoint(_event.offsetX, _event.offsetY);
          break;
      }
    }

    private hndPointerMoveTimeline = (_event: PointerEvent): void => {
      _event.preventDefault();
      let playbackTime: number = Math.max(0, this.getScreenToWorldPoint(_event.offsetX, 0).x);
      let pixelPerFrame: number = 1000 / this.animation.fps;
      this.playbackTime = Math.round(playbackTime / pixelPerFrame) * pixelPerFrame;
      this.dispatchAnimate();
    }

    private hndPointerMoveSlope = (_event: PointerEvent): void => {
      _event.preventDefault();
      let vctDelta: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(new ƒ.Vector2(_event.offsetX, _event.offsetY), this.selectedKey.posScreen);
      vctDelta.transform(ƒ.Matrix3x3.SCALING(this.mtxScreenToWorld.scaling));
      let slope: number = vctDelta.y / vctDelta.x;
      this.selectedKey.key.SlopeIn = slope;
      this.selectedKey.key.SlopeOut = slope;
      this.dispatchAnimate();
    }

    private hndPointerMovePan = (_event: PointerEvent): void => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(this.getScreenToWorldPoint(_event.offsetX, _event.offsetY), this.posDragStart);
      if (this.mode == SHEET_MODE.DOPE)
        translation.y = 0;
      this.mtxWorldToScreen.translate(translation);
      this.draw();
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      _event.preventDefault();

      if (this.scrollContainer.onscroll)
        this.draw();

      this.scrollContainer.onscroll = undefined;
      this.scrollContainer.onpointermove = undefined;
    }

    private hndWheel = (_event: WheelEvent) => {
      _event.preventDefault();
      if (_event.buttons != 0) return;
      let zoomFactor: number = _event.deltaY < 0 ? 1.05 : 0.95;
      let posCursorWorld: ƒ.Vector2 = this.getScreenToWorldPoint(_event.offsetX, _event.offsetY);
      
      let x: number = _event.shiftKey ? 1 : zoomFactor;
      let y: number = _event.ctrlKey || this.mode == SHEET_MODE.DOPE ? 1 : zoomFactor;

      this.mtxWorldToScreen.translate(posCursorWorld);
      this.mtxWorldToScreen.scale(new ƒ.Vector2(x, y));
      this.mtxWorldToScreen.translate(ƒ.Vector2.SCALE(posCursorWorld, -1));

      this.draw();
    }

    private hndScroll = (_event: Event) => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = this.mtxWorldToScreen.translation;
      translation.x = -this.scrollContainer.scrollLeft;
      this.mtxWorldToScreen.translation = translation;
      this.draw(false);
    }

    private dispatchAnimate(): void {
      this.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph, data: { playbackTime: this.playbackTime } } });
    }
    //#endregion

    private resetView(): void {
      this.mtxWorldToScreen.reset();
      this.mtxWorldToScreen.scaleX(ViewAnimationSheet.PIXEL_PER_MILLISECOND); // apply scaling
      if (this.mode == SHEET_MODE.CURVES) {
        this.mtxWorldToScreen.scaleY(-1); // flip y
        this.mtxWorldToScreen.scaleY(ViewAnimationSheet.PIXEL_PER_VALUE); // apply scaling
      }
      this.mtxScreenToWorld = ƒ.Matrix3x3.INVERSION(this.mtxWorldToScreen);

      // TODO: adjust y scaling to fit highest and lowest key
      let translation: ƒ.Vector2 = this.mtxWorldToScreen.translation;
      if (this.mode == SHEET_MODE.CURVES) 
        translation.y = this.canvas.height / 2;
      else
        translation.y = ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.KEY_SIZE * 2;
      this.mtxWorldToScreen.translation = translation;
      let scaling: ƒ.Vector2 = this.mtxWorldToScreen.scaling;
      scaling.x = this.canvas.width / ((this.animation?.totalTime || ViewAnimationSheet.STANDARD_ANIMATION_LENGTH) * 1.2);
      this.mtxWorldToScreen.scaling = scaling;
    }

    private getScreenToWorldPoint(_x: number, _y: number): ƒ.Vector2 {
      let vector: ƒ.Vector2 = new ƒ.Vector2(_x, _y);
      vector.transform(this.mtxScreenToWorld);
      return vector;
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

