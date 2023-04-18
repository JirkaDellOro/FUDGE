namespace FudgeCore {
  /**
   * Custom touch events
   */
  export enum EVENT_TOUCH {
    /** custom event fired in addition to the standard touchmove, details offset to starting touch */
    MOVE = "touchMove",
    /** custom event fired when the touches haven't moved outside of the tap radius */
    TAP = "touchTap",
    /** custom event fired when the touches have moved outside of the notch radius, details offset and cardinal direction */
    NOTCH = "touchNotch",
    /** custom event fired when the touches haven't moved outside of the tap radius for some time */
    LONG = "touchLong",
    /** custom event fired when two taps were detected in short succession */
    DOUBLE = "touchDouble",
    /** custom event fired when the distance between the only two touches changes beyond a tolerance */
    PINCH = "touchPinch",
    /** custom event not implemented yet */
    ROTATE = "touchRotate"
  }

  /** Details for CustomTouchEvents, use as generic CustomEvent<EventTouchDetail> */
  export interface EventTouchDetail {
    position: Vector2;
    touches: TouchList;
    offset?: Vector2;
    movement?: Vector2;
    cardinal?: Vector2;
    pinch?: Vector2;
    pinchDelta?: number;
  }

  /**
   * Dispatches CustomTouchEvents to the EventTarget given with the constructor.
   * When using touch events, make sure to set `touch-action: none` in CSS 
   * @author Jirka Dell'Oro-Friedl, HFU, 2022
   */
  export class TouchEventDispatcher {
    public posStart: Vector2 = Vector2.ZERO();
    public posNotch: Vector2 = Vector2.ZERO();
    public radiusTap: number;
    public radiusNotch: number;
    private target: EventTarget;
    private posPrev: Vector2 = Vector2.ZERO();
    private moved: boolean = false;
    private timerDouble: Timer;
    private timerLong: Timer;
    private timeDouble: number;
    private timeLong: number;
    private time: Time = new Time();
    private pinchDistance: number = 0;
    private pinchTolerance: number = 1;

    public constructor(_target: EventTarget, _radiusTap: number = 5, _radiusNotch: number = 50, _timeDouble: number = 200, _timerLong: number = 1000) {
      this.target = _target;
      this.radiusTap = _radiusTap;
      this.radiusNotch = _radiusNotch;
      this.timeDouble = _timeDouble;
      this.timeLong = _timerLong;
      this.activate(true);
    }

    /**
     * De-/Activates the dispatch of CustomTouchEvents
     */
    public activate(_on: boolean): void {
      if (_on) {
        this.target.addEventListener("touchstart", <EventListener>this.hndEvent);
        this.target.addEventListener("touchend", <EventListener>this.hndEvent);
        this.target.addEventListener("touchmove", <EventListener>this.hndEvent);
        return;
      }

      this.target.removeEventListener("touchstart", <EventListener>this.hndEvent);
      this.target.removeEventListener("touchend", <EventListener>this.hndEvent);
      this.target.removeEventListener("touchmove", <EventListener>this.hndEvent);
    }

    private hndEvent = (_event: TouchEvent): void => {
      _event.preventDefault();
      let touchFirst: Touch = _event.touches[0];
      let position: Vector2 = this.calcAveragePosition(_event.touches); //new Vector2(touchFirst?.clientX, touchFirst?.clientY);
      let offset: Vector2;

      switch (_event.type) {
        case "touchstart":
          this.moved = false;
          this.startGesture(position);

          if (_event.touches.length == 2) {
            // reset pinch
            let pinch: Vector2 = new Vector2(_event.touches[1].clientX - touchFirst.clientX, _event.touches[1].clientY - touchFirst.clientY);
            this.pinchDistance = pinch.magnitude;
          }

          let dispatchLong: TimerHandler = (_eventTimer: EventTimer): void => {
            this.moved = true;
            this.target.dispatchEvent(
              new CustomEvent<EventTouchDetail>(EVENT_TOUCH.LONG, {
                bubbles: true, detail: { position: position, touches: _event.touches }
              })
            );
          };

          this.timerLong?.clear();
          this.timerLong = new Timer(this.time, this.timeLong, 1, dispatchLong);
          break;
        case "touchend":
          this.timerLong?.clear();

          if (_event.touches.length > 0) {
            // still touches active
            this.startGesture(position);
            break;
          }

          let dispatchTap: TimerHandler = (_eventTimer: EventTimer): void => {
            this.target.dispatchEvent(
              new CustomEvent<EventTouchDetail>(EVENT_TOUCH.TAP, {
                bubbles: true, detail: { position: position, touches: _event.touches }
              })
            );
          };

          // check if there was a tap before and timer is still running -> double tap
          if (this.timerDouble?.active) {
            this.timerDouble.clear();
            // this.timer = undefined;
            this.target.dispatchEvent(
              new CustomEvent<EventTouchDetail>(EVENT_TOUCH.DOUBLE, {
                bubbles: true, detail: { position: position, touches: _event.touches }
              }));
          }
          // check if there was movement, otherwise set timer to fire tap
          else if (!this.moved)
            this.timerDouble = new Timer(this.time, this.timeDouble, 1, dispatchTap);

          break;
        case "touchmove":
          this.detectPinch(_event, position);
          offset = Vector2.DIFFERENCE(this.posPrev, this.posStart);
          this.moved ||= (offset.magnitude < this.radiusTap); // remember that touch moved over tap radius
          let movement: Vector2 = Vector2.DIFFERENCE(position, this.posPrev);
          this.target.dispatchEvent(
            new CustomEvent<EventTouchDetail>(EVENT_TOUCH.MOVE, {
              bubbles: true, detail: { position: position, touches: _event.touches, offset: offset, movement: movement }
            }));
          // fire notch when touches moved out of notch radius and reset notch
          offset = Vector2.DIFFERENCE(position, this.posNotch);
          if (offset.magnitude > this.radiusNotch) {
            let cardinal: Vector2 = Math.abs(offset.x) > Math.abs(offset.y) ?
              Vector2.X(offset.x < 0 ? -1 : 1) :
              Vector2.Y(offset.y < 0 ? -1 : 1);
            this.target.dispatchEvent(
              new CustomEvent<EventTouchDetail>(EVENT_TOUCH.NOTCH, {
                bubbles: true, detail: { position: position, touches: _event.touches, offset: offset, cardinal: cardinal, movement: movement }
              }));
            this.posNotch = position;
          }
          //TODO: pinch, rotate...
          break;
        default:
          break;
      }

      this.posPrev.set(position.x, position.y);
    }

    private detectPinch = (_event: TouchEvent, _position: Vector2): void => {
      if (_event.touches.length != 2)
        return;

      let t: TouchList = _event.touches;
      let pinch: Vector2 = new Vector2(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
      let pinchDistance: number = pinch.magnitude;
      let pinchDelta: number = pinchDistance - this.pinchDistance;
      if (Math.abs(pinchDelta) > this.pinchTolerance)
        this.target.dispatchEvent(
          new CustomEvent<EventTouchDetail>(EVENT_TOUCH.PINCH, {
            bubbles: true, detail: { position: _position, touches: _event.touches, pinch: pinch, pinchDelta: pinchDelta }
          }));
      this.pinchDistance = pinchDistance;
    }

    private startGesture(_position: Vector2): void {
      this.posNotch.set(_position.x, _position.y);
      this.posStart.set(_position.x, _position.y);
    }

    private calcAveragePosition(_touches: TouchList): Vector2 {
      let average: Vector2 = Vector2.ZERO();
      for (let touch of _touches) {
        average.x += touch.clientX;
        average.y += touch.clientY;
      }
      average.scale(1 / _touches.length);
      return average;
    }
  }
}

