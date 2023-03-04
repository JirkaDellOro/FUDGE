namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  enum SHEET_MODE {
    DOPE = "Dopesheet",
    CURVES = "Curves"
  }

  export interface ViewAnimationSequence {
    data: ƒ.AnimationSequence;
    color: string;
  }

  interface ViewAnimationKey {
    data: ƒ.AnimationKey;
    color: string;
    path2D: Path2D;
    type: "key";
  }

  interface ViewAnimationEvent { // labels and events are implemented almost the same way
    data: string;
    path2D: Path2D;
    type: "event" | "label";
  }

  /**
   * View and edit animation sequences, animation keys and curves connecting them.
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimationSheet extends View {
    private static readonly KEY_SIZE: number = 6; // width and height in px
    private static readonly TIMELINE_HEIGHT: number = 30.5; // in px, keep .5 at end for odd line width
    private static readonly EVENTS_HEIGHT: number = 30; // in px
    private static readonly SCALE_WIDTH: number = 40; // in px
    private static readonly PIXEL_PER_MILLISECOND: number = 1; // at scaling 1
    private static readonly PIXEL_PER_VALUE: number = 100; // at scaling 1
    private static readonly MINIMUM_PIXEL_PER_STEP: number = 60; // at any scaling, for both x and y
    private static readonly STANDARD_ANIMATION_LENGTH: number = 1000; // in miliseconds, used when animation length is falsy

    #mode: SHEET_MODE;

    private animation: ƒ.Animation;
    private playbackTime: number = 0;

    private canvas: HTMLCanvasElement = document.createElement("canvas");
    private crc2: CanvasRenderingContext2D = this.canvas.getContext("2d");
    private eventInput: HTMLInputElement = document.createElement("input");
    private scrollContainer: HTMLDivElement = document.createElement("div");
    private scrollBody: HTMLDivElement = document.createElement("div");
    private mtxWorldToScreen: ƒ.Matrix3x3 = new ƒ.Matrix3x3();

    private selectedKey: ViewAnimationKey;
    private selectedEvent: ViewAnimationEvent;
    private keys: ViewAnimationKey[] = [];
    private sequences: ViewAnimationSequence[] = [];
    private events: ViewAnimationEvent[] = [];
    private slopeHooks: Path2D[] = [];

    private documentStyle: CSSStyleDeclaration = window.getComputedStyle(document.documentElement);

    private posPanStart: ƒ.Vector2 = new ƒ.Vector2();
    private posRightClick: ƒ.Vector2 = new ƒ.Vector2();

    constructor(_container: ComponentContainer, _state: Object) {
      super(_container, _state);

      // maybe use this solution for all views?
      this.dom.style.position = "absolute";
      this.dom.style.inset = "0";
      this.dom.style.display = "block";
      this.dom.style.height = "auto";
      this.dom.style.padding = "0";
      this.dom.style.margin = "0.5em";
      this.dom.style.overflow = "hidden";

      this.mode = SHEET_MODE.DOPE;

      _container.on("resize", () => this.draw(true));
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenuSheet);

      this.canvas.style.position = "absolute";
      this.dom.appendChild(this.canvas);

      this.scrollContainer.style.position = "relative";
      this.scrollContainer.style.height = "100%";
      this.scrollContainer.style.overflowX = "scroll";
      this.scrollContainer.style.scrollBehavior = "instant";
      this.scrollContainer.onpointerdown = this.hndPointerDown;
      this.scrollContainer.onpointerup = this.hndPointerUp;
      this.scrollContainer.onpointerleave = this.hndPointerUp;
      this.scrollContainer.onwheel = this.hndWheel;
      this.dom.appendChild(this.scrollContainer);

      this.scrollBody.style.height = "1px";
      this.scrollContainer.appendChild(this.scrollBody);

      this.eventInput.type = "text";
      this.eventInput.hidden = true;
      this.eventInput.onfocus = () => this.scrollContainer.onpointerdown = undefined;
      this.eventInput.onchange = () => {
        if (this.selectedEvent.type == "event") {
          let time: number = this.animation.events[this.selectedEvent.data];
          this.animation.removeEvent(this.selectedEvent.data);
          this.animation.setEvent(this.eventInput.value, time);
        } else {
          let time: number = this.animation.labels[this.selectedEvent.data];
          delete this.animation.labels[this.selectedEvent.data];
          this.animation.labels[this.eventInput.value] = time;
        }
        this.selectedEvent.data = this.eventInput.value;
        this.scrollContainer.onpointerdown = this.hndPointerDown;
        this.draw();
      };
      this.dom.appendChild(this.eventInput);
    }

    private get mode(): SHEET_MODE {
      return this.#mode;
    }

    private set mode(_mode: SHEET_MODE) {
      this.#mode = _mode;
      this.setTitle(_mode);
      this.resetView();
      this.draw(true);
    }

    //#region context menu
    protected openContextMenuSheet = (_event: Event): void => {
      this.contextMenu.items.forEach(_item => _item.visible = false);
      if (this.posRightClick.y > ViewAnimationSheet.TIMELINE_HEIGHT && this.posRightClick.y < ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT) { // click on events
        let deleteEvent: ViewAnimationEvent =
          this.events.find(_object => this.crc2.isPointInPath(_object.path2D, this.posRightClick.x, this.posRightClick.y));
        if (deleteEvent) {
          if (deleteEvent.type == "event")
            this.contextMenu.getMenuItemById("Delete Event").visible = true;
          else
            this.contextMenu.getMenuItemById("Delete Label").visible = true;
          Reflect.set(this.contextMenu, "targetEvent", deleteEvent);
        } else {
          this.contextMenu.getMenuItemById("Add Label").visible = true;
          this.contextMenu.getMenuItemById("Add Event").visible = true;
          Reflect.set(this.contextMenu, "targetTime", this.screenToTime(this.posRightClick.x));
        }
        this.openContextMenu(_event);
      }

      if (this.posRightClick.y > ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT) {
        let targetKey: ViewAnimationKey = this.keys.find(_object => this.crc2.isPointInPath(_object.path2D, this.posRightClick.x, this.posRightClick.y));
        if (targetKey) {
          this.contextMenu.getMenuItemById("Delete Key").visible = true;
          Reflect.set(this.contextMenu, "targetKey", targetKey);
        } else {
          this.contextMenu.getMenuItemById(SHEET_MODE.DOPE).visible = this.mode != SHEET_MODE.DOPE;
          this.contextMenu.getMenuItemById(SHEET_MODE.CURVES).visible = this.mode != SHEET_MODE.CURVES;
        }
        this.openContextMenu(_event);
      }
    }

    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();

      let item: Electron.MenuItem;
      item = new remote.MenuItem({ id: SHEET_MODE.DOPE, label: SHEET_MODE.DOPE, click: () => this.mode = SHEET_MODE.DOPE });
      menu.append(item);
      item = new remote.MenuItem({ id: SHEET_MODE.CURVES, label: SHEET_MODE.CURVES, click: () => this.mode = SHEET_MODE.CURVES });
      menu.append(item);
      item = new remote.MenuItem({ id: "Add Event", label: "Add Event", click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ id: "Delete Event", label: "Delete Event", click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ id: "Add Label", label: "Add Label", click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ id: "Delete Label", label: "Delete Label", click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ id: "Delete Key", label: "Delete Key", click: _callback });
      menu.append(item);

      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      let choice: string = _item.id;
      ƒ.Debug.fudge(`MenuSelect | id: ${CONTEXTMENU[_item.id]} | event: ${_event}`);

      let targetKey: ViewAnimationKey = Reflect.get(this.contextMenu, "targetKey");
      let targetEvent: ViewAnimationEvent = Reflect.get(this.contextMenu, "targetEvent");
      let targetTime: number = Reflect.get(this.contextMenu, "targetTime");

      switch (choice) {
        case "Add Event":
          let eventName: string = `${this.animation.name}Event${Object.keys(this.animation.events).length}`;
          this.animation.setEvent(eventName, targetTime);
          this.selectedEvent = { data: eventName, path2D: null, type: "event" };
          this.draw();
          break;
        case "Delete Event":
          this.animation.removeEvent(targetEvent.data);
          this.draw();
          break;
        case "Add Label":
          let labelName: string = `${this.animation.name}Label${Object.keys(this.animation.events).length}`;
          this.animation.labels[labelName] = targetTime;
          this.selectedEvent = { data: labelName, path2D: null, type: "label" };
          this.draw();
          break;
        case "Delete Label":
          delete this.animation.labels[targetEvent.data];
          this.draw();
          break;
        case "Delete Key":
          let sequence: ƒ.AnimationSequence = this.sequences.find(_sequence => _sequence.data.getKeys().includes(targetKey.data)).data;
          if (sequence.length < 2) {
            ƒ.Debug.warn("Only one key left in sequence. Delete property instead.");
            break;
          }
          sequence.removeKey(targetKey.data);
          this.animate();
          break;
      }
    }
    //#endregion

    //#region drawing
    private draw(_scroll: boolean = false): void {
      this.canvas.width = this.dom.clientWidth;
      this.canvas.height = this.dom.clientHeight;

      let translation: ƒ.Vector2 = this.mtxWorldToScreen.translation;
      translation.x = Math.min(ViewAnimationSheet.SCALE_WIDTH, translation.x);
      this.mtxWorldToScreen.translation = translation;

      if (this.animation) {
        this.generateKeys();
        this.drawTimeline();
        this.drawEvents();
        this.drawScale();
        this.drawCurves();
        this.drawKeys();
        this.drawCursor();
        this.drawHighlight();
      }

      if (_scroll) {
        let leftWidth: number = -this.mtxWorldToScreen.translation.x + ViewAnimationSheet.SCALE_WIDTH;
        let screenWidth: number = this.canvas.width + leftWidth;
        let animationWidth: number = this.animation?.totalTime * this.mtxWorldToScreen.scaling.x + ViewAnimationSheet.SCALE_WIDTH * 2;
        this.scrollBody.style.width = `${Math.max(animationWidth, screenWidth)}px`;
        this.scrollContainer.scrollLeft = leftWidth;
      }
    }

    private generateKeys(): void {
      this.keys = this.sequences.flatMap((_sequence, _iSequence) =>
        _sequence.data.getKeys().map((_key) => {
          let viewKey: ViewAnimationKey = {
            data: _key,
            color: _sequence.color,
            path2D: this.generateKey(
              this.worldToScreenPoint(_key.time, this.mode == SHEET_MODE.CURVES ? _key.value : _iSequence * ViewAnimationSheet.KEY_SIZE * 4),
              ViewAnimationSheet.KEY_SIZE,
              ViewAnimationSheet.KEY_SIZE
            ),
            type: "key"
          };
          return viewKey;
        }
        ));

      if (this.selectedKey)
        this.selectedKey = this.keys.find(_key => _key.data == this.selectedKey.data);
    }

    private generateKey(_position: ƒ.Vector2, _w: number, _h: number): Path2D {
      let path: Path2D = new Path2D();
      path.moveTo(_position.x - _w, _position.y);
      path.lineTo(_position.x, _position.y + _h);
      path.lineTo(_position.x + _w, _position.y);
      path.lineTo(_position.x, _position.y - _h);
      path.closePath();
      return path;
    }

    private drawTimeline(): void {
      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-background-main");
      this.crc2.fillRect(0, 0, this.canvas.width, ViewAnimationSheet.TIMELINE_HEIGHT);

      let animationStart: number = Math.min(...this.keys.map(_key => _key.data.time)) * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x;
      let animationEnd: number = Math.max(...this.keys.map(_key => _key.data.time)) * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x;
      this.crc2.fillStyle = "rgba(100, 100, 255, 0.2)";
      this.crc2.fillRect(animationStart, 0, animationEnd - animationStart, ViewAnimationSheet.TIMELINE_HEIGHT);

      this.crc2.beginPath();
      this.crc2.moveTo(0, ViewAnimationSheet.TIMELINE_HEIGHT);
      this.crc2.lineTo(this.canvas.width, ViewAnimationSheet.TIMELINE_HEIGHT);
      this.crc2.lineWidth = 1;
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.stroke();

      let fps: number = this.animation.fps;
      let pixelPerFrame: number = (1000 * ViewAnimationSheet.PIXEL_PER_MILLISECOND) / fps;
      let pixelPerStep: number = pixelPerFrame * this.mtxWorldToScreen.scaling.x;
      let framesPerStep: number = 1;

      // TODO: find a way to do this with O(1);
      let multipliers: number[] = [2, 3, 2, 5];
      let iMultipliers: number = 2;
      while (pixelPerStep < ViewAnimationSheet.MINIMUM_PIXEL_PER_STEP) {
        iMultipliers = (iMultipliers + 1) % multipliers.length;
        let multiplier: number = multipliers[iMultipliers];
        pixelPerStep *= multiplier;
        framesPerStep *= multiplier;
      }

      let subSteps: number = 0;
      let highSteps: number = 0; // every nth step will be higher
      if (framesPerStep != 1) {
        if (framesPerStep == 5) {
          subSteps = 4;
        } else {
          switch (iMultipliers) {
            case 0:
              subSteps = 9;
              highSteps = 5;
              break;
            case 2:
              subSteps = 5;
              highSteps = 3;
              break;
            case 1:
              subSteps = 5;
              highSteps = 2;
              break;
            case 3:
              subSteps = 9;
              highSteps = 2;
              break;
          }
        }
      }

      let gridLines: Path2D = new Path2D();
      let timeSteps: Path2D = new Path2D();

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.textBaseline = "middle";
      this.crc2.textAlign = "left";
      this.crc2.font = this.documentStyle.font;

      let steps: number = 1 + this.canvas.width / pixelPerStep;
      let stepOffset: number = Math.floor(Math.abs(this.mtxWorldToScreen.translation.x) / pixelPerStep);
      for (let iStep: number = stepOffset; iStep < steps + stepOffset; iStep++) {
        let xStep: number = this.round(iStep * pixelPerStep + this.mtxWorldToScreen.translation.x);
        timeSteps.moveTo(xStep, ViewAnimationSheet.TIMELINE_HEIGHT);
        timeSteps.lineTo(xStep, ViewAnimationSheet.TIMELINE_HEIGHT - 20);
        gridLines.moveTo(xStep, ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT);
        gridLines.lineTo(xStep, this.canvas.height);
        let time: number = iStep * framesPerStep / fps;
        this.crc2.fillText(
          `${time.toFixed(2)}`,
          xStep + 3,
          ViewAnimationSheet.TIMELINE_HEIGHT - 20);

        let pixelPerSubStep: number = pixelPerStep / (subSteps + 1);
        for (let iSubStep: number = 1; iSubStep < subSteps + 1; iSubStep++) {
          let xSubStep: number = xStep + Math.round(iSubStep * pixelPerSubStep);
          timeSteps.moveTo(xSubStep, ViewAnimationSheet.TIMELINE_HEIGHT);
          timeSteps.lineTo(xSubStep, ViewAnimationSheet.TIMELINE_HEIGHT - (iSubStep % highSteps == 0 ? 12 : 8));
        }
      }

      this.crc2.stroke(timeSteps);
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-background-main");
      this.crc2.stroke(gridLines);
    }

    private drawEvents(): void {
      let totalHeight: number = ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT;

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-background-main");
      this.crc2.fillRect(0, ViewAnimationSheet.TIMELINE_HEIGHT + 0.5, this.canvas.width, ViewAnimationSheet.EVENTS_HEIGHT);

      this.crc2.beginPath();
      this.crc2.moveTo(0, totalHeight);
      this.crc2.lineTo(this.canvas.width, totalHeight);
      this.crc2.lineWidth = 1;
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.stroke();

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-text");

      this.events = [];
      if (!this.animation) return;

      for (const label in this.animation.labels) {
        let x: number = this.timeToScreen(this.animation.labels[label]);
        let viewLabel: ViewAnimationEvent = { data: label, path2D: generateLabel(x), type: "label" };
        this.events.push(viewLabel);
        this.crc2.stroke(viewLabel.path2D);
      }

      for (const event in this.animation.events) {
        let x: number = this.timeToScreen(this.animation.events[event]);
        let viewEvent: ViewAnimationEvent = { data: event, path2D: generateEvent(x), type: "event" };
        this.events.push(viewEvent);
        this.crc2.stroke(viewEvent.path2D);
      }

      this.selectedEvent = this.events.find(_event => _event.data == this.selectedEvent?.data);
      this.eventInput.hidden = this.selectedEvent == null;
      if (this.selectedEvent) {
        this.crc2.fill(this.selectedEvent.path2D);
        this.eventInput.style.left = `${(this.selectedEvent.type == "event" ? this.animation.events : this.animation.labels)[this.selectedEvent.data] * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x + 12}px`;
        this.eventInput.className = this.selectedEvent.type;
        // if (this.selectedEvent.type == "label")
        //   this.eventInput.style.top = `${ViewAnimationSheet.TIMELINE_HEIGHT}px`;
        // else
        //   this.eventInput.style.top = `${ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT / 2 - 2}px`;
        this.eventInput.value = this.selectedEvent.data;
      }

      this.crc2.save();
      this.crc2.rect(0, ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT, this.canvas.width, this.canvas.height);
      this.crc2.clip();

      function generateEvent(_x: number): Path2D {
        let path: Path2D = new Path2D;
        path.moveTo(_x, totalHeight - 26);
        path.lineTo(_x, totalHeight - 4);
        path.lineTo(_x, totalHeight - 10);
        path.lineTo(_x + 8, totalHeight - 16);
        path.lineTo(_x + 8, totalHeight - 4);
        path.lineTo(_x, totalHeight - 10);
        // path.closePath();
        return path;
      }

      function generateLabel(_x: number): Path2D {
        let path: Path2D = new Path2D;
        path.moveTo(_x, totalHeight - 4);
        path.lineTo(_x, totalHeight - 26);
        path.lineTo(_x + 8, totalHeight - 20);
        path.lineTo(_x, totalHeight - 14);
        // path.lineTo(_x, totalHeight - 26);
        // path.closePath();
        return path;
      }
    }

    private drawScale(): void {
      if (this.mode != SHEET_MODE.CURVES) return;

      let center: number = this.round(this.mtxWorldToScreen.translation.y);
      this.crc2.beginPath();
      this.crc2.moveTo(0, center);
      this.crc2.lineTo(this.canvas.width, center);
      this.crc2.lineWidth = 1;
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.stroke();

      let pixelPerStep: number = -this.mtxWorldToScreen.scaling.y;
      let valuePerStep: number = 1;

      let multipliers: number[] = [2, 5];
      let iMultipliers: number = 0;
      while (pixelPerStep < ViewAnimationSheet.MINIMUM_PIXEL_PER_STEP) {
        iMultipliers = (iMultipliers + 1) % multipliers.length;
        let multiplier: number = multipliers[iMultipliers];
        pixelPerStep *= multiplier;
        valuePerStep *= multiplier;
      }
      let subSteps: number = 0;
      switch (iMultipliers) {
        case 0:
          subSteps = 1;
          break;
        case 1:
          subSteps = 4;
          break;
      }

      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-highlight");
      this.crc2.textBaseline = "bottom";
      this.crc2.textAlign = "right";

      let steps: number = 1 + this.canvas.height / pixelPerStep;
      let stepOffset: number = Math.floor(-this.mtxWorldToScreen.translation.y / pixelPerStep);
      for (let iStep: number = stepOffset; iStep < steps + stepOffset; iStep++) {
        let yStep: number = this.round(iStep * pixelPerStep + this.mtxWorldToScreen.translation.y);
        this.crc2.beginPath();
        this.crc2.moveTo(0, yStep);
        this.crc2.lineTo(ViewAnimationSheet.SCALE_WIDTH - 5, yStep);
        let value: number = -iStep * valuePerStep;
        this.crc2.fillText(
          valuePerStep >= 1 ? value.toFixed(0) : value.toFixed(1),
          33,
          yStep);
        this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
        this.crc2.stroke();

        let pixelPerSubStep: number = pixelPerStep / (subSteps + 1);
        for (let iSubStep: number = 1; iSubStep < subSteps + 1; iSubStep++) {
          let ySubStep: number = yStep + Math.round(iSubStep * pixelPerSubStep);
          this.crc2.beginPath();
          this.crc2.moveTo(0, ySubStep);
          this.crc2.lineTo(ViewAnimationSheet.SCALE_WIDTH - 5, ySubStep);
          this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-background-main");
          this.crc2.stroke();
        }
      }
    }

    private drawCurves(): void {
      if (this.mode != SHEET_MODE.CURVES) return;

      for (const sequence of this.sequences) {
        this.crc2.strokeStyle = sequence.color;
        sequence.data.getKeys()
          .map((_key, _index, _keys) => [_key, _keys[_index + 1]])
          .filter(([_keyStart, _keyEnd]) => _keyStart && _keyEnd)
          .map(([_keyStart, _keyEnd]) => getBezierPoints(_keyStart.functionOut, _keyStart, _keyEnd))
          .forEach((_bezierPoints) => {
            _bezierPoints.forEach(_point => _point.transform(this.mtxWorldToScreen));
            let curve: Path2D = new Path2D();
            curve.moveTo(_bezierPoints[0].x, _bezierPoints[0].y);
            curve.bezierCurveTo(
              _bezierPoints[1].x, _bezierPoints[1].y,
              _bezierPoints[2].x, _bezierPoints[2].y,
              _bezierPoints[3].x, _bezierPoints[3].y
            );
            this.crc2.stroke(curve);
            _bezierPoints.forEach(_point => ƒ.Recycler.store(_point));
          });
      }

      function getBezierPoints(_animationFunction: ƒ.AnimationFunction, _keyStart: ƒ.AnimationKey, _keyEnd: ƒ.AnimationKey): ƒ.Vector2[] {
        let parameters: { a: number; b: number; c: number; d: number } = _animationFunction.getParameters();
        const polarForm: (u: number, v: number, w: number) => number = (u, v, w) => {
          return (
            parameters.a * u * v * w +
            parameters.b * ((v * w + w * u + u * v) / 3) +
            parameters.c * ((u + v + w) / 3) +
            parameters.d
          );
        };
        let xStart: number = _keyStart.time;
        let xEnd: number = _keyEnd.time;
        let offsetTimeEnd: number = xEnd - xStart;

        let points: ƒ.Vector2[] = new Array(4).fill(0).map(() => ƒ.Recycler.get(ƒ.Vector2));
        points[0].set(xStart, polarForm(0, 0, 0));
        points[1].set(xStart + offsetTimeEnd * 1 / 3, polarForm(0, 0, offsetTimeEnd));
        points[2].set(xStart + offsetTimeEnd * 2 / 3, polarForm(0, offsetTimeEnd, offsetTimeEnd));
        points[3].set(xStart + offsetTimeEnd, polarForm(offsetTimeEnd, offsetTimeEnd, offsetTimeEnd));

        return points;
      }
    }

    private drawKeys(): void {
      // draw unselected keys
      this.crc2.lineWidth = 4;
      this.keys.forEach(_key => {
        if (_key == this.selectedKey) return;

        this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
        this.crc2.fillStyle = _key.color;
        this.crc2.stroke(_key.path2D);
        this.crc2.fill(_key.path2D);
      });

      // draw selected key
      if (!this.selectedKey) return;

      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-signal");
      this.crc2.fillStyle = this.selectedKey.color;
      this.crc2.stroke(this.selectedKey.path2D);
      this.crc2.fill(this.selectedKey.path2D);

      // draw slope hooks
      if (this.mode != SHEET_MODE.CURVES) return;

      this.crc2.lineWidth = 1;
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-text");
      this.crc2.fillStyle = this.crc2.strokeStyle;

      let [left, right] = [ƒ.Recycler.get(ƒ.Vector2), ƒ.Recycler.get(ƒ.Vector2)];
      left.set(-50, 0);
      right.set(50, 0);

      let angleSlopeScreen: number = Math.atan(this.selectedKey.data.slopeIn * (this.mtxWorldToScreen.scaling.y / this.mtxWorldToScreen.scaling.x)) * (180 / Math.PI); // in degree
      let mtxTransform: ƒ.Matrix3x3 = ƒ.Matrix3x3.IDENTITY();
      mtxTransform.translate(this.worldToScreenPoint(this.selectedKey.data.time, this.selectedKey.data.value));
      mtxTransform.rotate(angleSlopeScreen);
      left.transform(mtxTransform);
      right.transform(mtxTransform);

      let path: Path2D = new Path2D();
      path.moveTo(left.x, left.y);
      path.lineTo(right.x, right.y);
      this.crc2.stroke(path);
      this.slopeHooks = [this.generateKey(left, 5, 5), this.generateKey(right, 5, 5)];
      this.slopeHooks.forEach(_hook => this.crc2.fill(_hook));

      ƒ.Recycler.store(left);
      ƒ.Recycler.store(right);
    }

    private drawCursor(): void {
      this.crc2.restore();
      let x: number = this.timeToScreen(this.playbackTime);
      let cursor: Path2D = new Path2D();
      cursor.moveTo(x, 0);
      cursor.lineTo(x, this.canvas.height);
      this.crc2.lineWidth = 1;
      this.crc2.strokeStyle = this.documentStyle.getPropertyValue("--color-signal");
      this.crc2.stroke(cursor);
    }

    private drawHighlight(): void {
      if (!this.selectedKey) return;

      let posScreen: ƒ.Vector2 = this.worldToScreenPoint(this.selectedKey.data.time, this.selectedKey.data.value);
      this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-highlight");
      this.crc2.fillStyle += "66";
      this.crc2.fillRect(posScreen.x - ViewAnimationSheet.KEY_SIZE / 2, 0, ViewAnimationSheet.KEY_SIZE, ViewAnimationSheet.TIMELINE_HEIGHT);

      if (this.mode == SHEET_MODE.CURVES) {
        this.crc2.fillStyle = this.documentStyle.getPropertyValue("--color-highlight");
        this.crc2.fillStyle += "26";
        this.crc2.fillRect(0, posScreen.y - ViewAnimationSheet.KEY_SIZE / 2, posScreen.x, ViewAnimationSheet.KEY_SIZE);
        this.crc2.fillRect(posScreen.x - ViewAnimationSheet.KEY_SIZE / 2, ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT, ViewAnimationSheet.KEY_SIZE, posScreen.y - ViewAnimationSheet.TIMELINE_HEIGHT - ViewAnimationSheet.EVENTS_HEIGHT);
      }
    }
    //#endregion

    //#region event handling
    private hndEvent = (_event: EditorEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
          if (_event.detail.view == this)
            break;

          if (_event.detail.node != null) {
            this.animation = _event.detail.node?.getComponent(ƒ.ComponentAnimator)?.animation;
            // this.animation.removeEventListener(ƒ.EVENT.MUTATE, () => this.resetView);
            this.animation.addEventListener(ƒ.EVENT.MUTATE, () => {
              this.resetView(); this.animate(); this.draw(true);
            });
            this.resetView();
            this.draw(true);
          }

          if (_event.detail.data instanceof ƒ.AnimationKey) {
            this.selectedKey = this.keys.find(_key => _key.data == _event.detail.data);
            this.draw();
            break;
          }

          if (_event.detail.data != null) {
            this.sequences = _event.detail.data;
            this.draw();
          }
          break;
        case EVENT_EDITOR.MODIFY:
          this.playbackTime = _event.detail.data;
          this.draw();
          this.dispatch(EVENT_EDITOR.UPDATE, { bubbles: true });
          break;
      }
    }

    private hndPointerDown = (_event: PointerEvent): void => {
      _event.preventDefault();
      this.canvas.focus();
      const findObject: (_object: ViewAnimationKey | ViewAnimationEvent) => boolean = _object => this.crc2.isPointInPath(_object.path2D, _event.offsetX, _event.offsetY);
      switch (_event.buttons) {
        case 1:
          if (_event.offsetY > (<HTMLElement>_event.target).clientHeight) // clicked on scroll bar
            this.scrollContainer.onscroll = this.hndScroll;
          else if (_event.offsetY <= ViewAnimationSheet.TIMELINE_HEIGHT) {
            this.hndPointerMoveTimeline(_event);
            this.scrollContainer.onpointermove = this.hndPointerMoveTimeline;
          } else if (this.slopeHooks.some(_hook => this.crc2.isPointInPath(_hook, _event.offsetX, _event.offsetY))) {
            this.scrollContainer.onpointermove = this.hndPointerMoveSlope;
          } else {
            let selected: ViewAnimationKey | ViewAnimationEvent =
              this.keys.find(findObject) ||
              this.events.find(findObject);

            if (!selected) {
              this.selectedKey = null;
              this.selectedEvent = null;
              this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: null } });
            } else switch (selected.type) {
              case "label":
              case "event":
                this.selectedEvent = selected;
                this.scrollContainer.onpointermove = this.hndPointerMoveDragEvent;
                break;
              case "key":
                this.selectedKey = selected;
                this.scrollContainer.onpointermove = this.hndPointerMoveDragKey;
                this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: this.selectedKey.data } });
                this.playbackTime = this.selectedKey.data.time;
                this.animate();
                break;
            }
            this.draw();
          }
          break;
        case 2:
          this.posRightClick.x = _event.offsetX;
          this.posRightClick.y = _event.offsetY;
          break;
        case 4:
          this.posPanStart = this.screenToWorldPoint(_event.offsetX, _event.offsetY);
          this.scrollContainer.onpointermove = this.hndPointerMovePan;
          break;
      }
    }

    private hndPointerMoveTimeline = (_event: PointerEvent): void => {
      _event.preventDefault();
      this.playbackTime = this.screenToTime(_event.offsetX);
      this.animate();
    }

    private hndPointerMoveSlope = (_event: PointerEvent): void => {
      _event.preventDefault();
      let vctDelta: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(new ƒ.Vector2(_event.offsetX, _event.offsetY), this.worldToScreenPoint(this.selectedKey.data.time, this.selectedKey.data.value));
      vctDelta.transform(ƒ.Matrix3x3.SCALING(ƒ.Matrix3x3.INVERSION(this.mtxWorldToScreen).scaling));
      let slope: number = vctDelta.y / vctDelta.x;
      this.selectedKey.data.slopeIn = slope;
      this.selectedKey.data.slopeOut = slope;
      this.animate();
    }

    private hndPointerMovePan = (_event: PointerEvent): void => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(this.screenToWorldPoint(_event.offsetX, _event.offsetY), this.posPanStart);
      if (this.mode == SHEET_MODE.DOPE)
        translation.y = 0;
      this.mtxWorldToScreen.translate(translation);
      this.draw(true);
    }

    private hndPointerMoveDragKey = (_event: PointerEvent): void => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = this.screenToWorldPoint(_event.offsetX, _event.offsetY);
      let pixelPerFrame: number = 1000 / this.animation.fps;
      translation.x = Math.max(0, translation.x);
      translation.x = Math.round(translation.x / pixelPerFrame) * pixelPerFrame;

      let key: ƒ.AnimationKey = this.selectedKey.data;
      let sequence: ƒ.AnimationSequence = this.sequences.find(_sequence => _sequence.data.getKeys().includes(key)).data;
      sequence.modifyKey(key, translation.x, this.mode == SHEET_MODE.DOPE || _event.shiftKey ? null : translation.y);
      this.animation.calculateTotalTime();
      this.playbackTime = key.time;
      this.animate();
    }

    private hndPointerMoveDragEvent = (_event: PointerEvent): void => {
      _event.preventDefault();
      let time: number = this.screenToTime(_event.offsetX);
      if (this.selectedEvent.type == "event")
        this.animation.setEvent(this.selectedEvent.data, time);
      else
        this.animation.labels[this.selectedEvent.data] = time;
      this.draw();
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      _event.preventDefault();

      if (this.scrollContainer.onscroll)
        this.draw(true);

      this.scrollContainer.onscroll = undefined;
      this.scrollContainer.onpointermove = undefined;
    }

    private hndWheel = (_event: WheelEvent) => {
      _event.preventDefault();
      if (_event.buttons != 0) return;
      let zoomFactor: number = _event.deltaY < 0 ? 1.05 : 0.95;
      let posCursorWorld: ƒ.Vector2 = this.screenToWorldPoint(_event.offsetX, _event.offsetY);

      let x: number = _event.shiftKey ? 1 : zoomFactor;
      let y: number = _event.ctrlKey || this.mode == SHEET_MODE.DOPE ? 1 : zoomFactor;

      this.mtxWorldToScreen.translate(posCursorWorld);
      this.mtxWorldToScreen.scale(new ƒ.Vector2(x, y));
      this.mtxWorldToScreen.translate(ƒ.Vector2.SCALE(posCursorWorld, -1));

      this.draw(true);
    }

    private hndScroll = (_event: Event) => {
      _event.preventDefault();
      let translation: ƒ.Vector2 = this.mtxWorldToScreen.translation;
      translation.x = -this.scrollContainer.scrollLeft + ViewAnimationSheet.SCALE_WIDTH;
      this.mtxWorldToScreen.translation = translation;
      this.draw();
    }

    private animate(): void {
      this.dispatch(EVENT_EDITOR.MODIFY, { bubbles: true, detail: { data: this.playbackTime } });
    }
    //#endregion

    private resetView(): void {
      this.mtxWorldToScreen.reset();
      this.mtxWorldToScreen.scaleX(ViewAnimationSheet.PIXEL_PER_MILLISECOND); // apply scaling
      this.mtxWorldToScreen.scaleX((this.canvas.width - 2 * ViewAnimationSheet.SCALE_WIDTH) / ((this.animation?.totalTime || ViewAnimationSheet.STANDARD_ANIMATION_LENGTH)));
      this.mtxWorldToScreen.translateX(ViewAnimationSheet.SCALE_WIDTH);
      if (this.mode == SHEET_MODE.CURVES) {
        this.mtxWorldToScreen.scaleY(-1); // flip y
        this.mtxWorldToScreen.scaleY(ViewAnimationSheet.PIXEL_PER_VALUE); // apply scaling

        let values: number[] = this.sequences
          .flatMap(_sequence => _sequence.data.getKeys())
          .map(_key => _key.value);
        if (values.length > 1) {
          let min: number = values.reduce((_a, _b) => Math.min(_a, _b)); // in world space
          let max: number = values.reduce((_a, _b) => Math.max(_a, _b)); // in world space
          let viewHeight: number = (this.canvas.height - ViewAnimationSheet.TIMELINE_HEIGHT - ViewAnimationSheet.EVENTS_HEIGHT); // in px
          if (min != max)
            this.mtxWorldToScreen.scaleY(viewHeight / (((max - min) * ViewAnimationSheet.PIXEL_PER_VALUE) * 1.2));
          this.mtxWorldToScreen.translateY(viewHeight - min * this.mtxWorldToScreen.scaling.y);
        }
      } else {
        this.mtxWorldToScreen.translateY(ViewAnimationSheet.TIMELINE_HEIGHT + ViewAnimationSheet.EVENTS_HEIGHT + ViewAnimationSheet.KEY_SIZE * 2);
      }
    }

    private screenToWorldPoint(_x: number, _y: number): ƒ.Vector2 {
      let vector: ƒ.Vector2 = new ƒ.Vector2(_x, _y);
      vector.transform(ƒ.Matrix3x3.INVERSION(this.mtxWorldToScreen));
      return vector;
    }

    private worldToScreenPoint(_x: number, _y: number): ƒ.Vector2 {
      let vector: ƒ.Vector2 = new ƒ.Vector2(_x, _y);
      vector.transform(this.mtxWorldToScreen);
      vector.x = this.round(vector.x);
      vector.y = this.round(vector.y);
      return vector;
    }

    private screenToTime(_x: number): number {
      let playbackTime: number = Math.max(0, (_x - this.mtxWorldToScreen.translation.x) / this.mtxWorldToScreen.scaling.x);
      return playbackTime;
    }

    private timeToScreen(_time: number): number {
      return this.round(_time * this.mtxWorldToScreen.scaling.x + this.mtxWorldToScreen.translation.x);
    }

    private round(_value: number): number { // this is needed for lines to be displayed crisp on the canvas
      if (Math.trunc(this.crc2.lineWidth) % 2 == 0)
        return Math.round(_value); // even line width
      else
        return Math.round(_value) + 0.5; // odd line width
    }
  }
}