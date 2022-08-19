namespace FudgeCore {
  export enum EVENT_TOUCH {
    /** the standard touchstart, in here for completeness */
    START = "touchstart",
    /** the standard touchend, in here for completeness */
    END = "touchend",
    /** the standard touchmove, in here for completeness */
    MOVE = "touchmove",
    /** the standard touchcancel, in here for completeness */
    CANCEL = "touchcancel",
    /** custom event fired when the touches haven't moved outside of the tap radius */
    TAP = "touchTap",
    /** custom event fired when the touches have moved outside of the notch radius, details offset and cardinal direction */
    NOTCH = "touchNotch",
    /** custom event fired when the touches haven't moved outside of the tap radius for some time */
    LONG = "touchLong",
    /** custom event fired when two taps were detected in short succession */
    DOUBLE = "touchDouble",
    /** custom event not implemented yet */
    PINCH = "touchPinch",
    /** custom event not implemented yet */
    ROTATE = "touchRotate"
  }

  export class EventTouch {
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

    public constructor(_target: EventTarget, _radiusTap: number = 5, _radiusNotch: number = 50, _timeDouble: number = 200, _timerLong: number = 1000) {
      _target.addEventListener(EVENT_TOUCH.START, <EventListener>this.hndEvent);
      _target.addEventListener(EVENT_TOUCH.END, <EventListener>this.hndEvent);
      _target.addEventListener(EVENT_TOUCH.MOVE, <EventListener>this.hndEvent);
      this.target = _target;
      this.radiusTap = _radiusTap;
      this.radiusNotch = _radiusNotch;
      this.timeDouble = _timeDouble;
      this.timeLong = _timerLong;
    }

    public hndEvent = (_event: TouchEvent): void => {
      _event.preventDefault();
      let touchLast: Touch = _event.touches[0];
      let position: Vector2 = new Vector2(touchLast?.clientX, touchLast?.clientY);
      let offset: Vector2;

      switch (_event.type) {
        case EVENT_TOUCH.START:
          this.moved = false;
          this.startGesture(position);

          let dispatchLong: TimerHandler = (_eventTimer: EventTimer): void => {
            this.moved = true;
            this.target.dispatchEvent(
              new CustomEvent(EVENT_TOUCH.LONG, {
                bubbles: true, detail: { position: position, touches: _event.touches }
              })
            );
          };

          this.timerLong?.clear();
          this.timerLong = new Timer(this.time, this.timeLong, 1, dispatchLong);
          break;
        case EVENT_TOUCH.END:
          this.timerLong?.clear();

          if (_event.touches.length > 0) {
            // still touches active
            this.startGesture(position);
            break;
          }

          let dispatchTap: TimerHandler = (_eventTimer: EventTimer): void => {
            this.target.dispatchEvent(
              new CustomEvent(EVENT_TOUCH.TAP, {
                bubbles: true, detail: { position: position, touches: _event.touches }
              })
            );
          };

          // check if there was a tap before and timer is still running -> double tap
          if (this.timerDouble?.active) {
            this.timerDouble.clear();
            // this.timer = undefined;
            this.target.dispatchEvent(
              new CustomEvent(EVENT_TOUCH.DOUBLE, {
                bubbles: true, detail: { position: position, touches: _event.touches }
              }));
          }
          // check if there was movement, otherwise set timer to fire tap
          else if (!this.moved)
            this.timerDouble = new Timer(this.time, this.timeDouble, 1, dispatchTap);

          break;
        case EVENT_TOUCH.MOVE:
          offset = Vector2.DIFFERENCE(this.posPrev, this.posStart);
          this.moved ||= (offset.magnitude < this.radiusTap); // remember that touch moved over tap radius

          // fire notch when touches moved out of notch radius and reset notch
          offset = Vector2.DIFFERENCE(position, this.posNotch);
          if (offset.magnitude > this.radiusNotch) {
            let cardinal: Vector2 = Math.abs(offset.x) > Math.abs(offset.y) ?
              Vector2.X(offset.x < 0 ? -1 : 1) :
              Vector2.Y(offset.y < 0 ? -1 : 1);
            this.target.dispatchEvent(
              new CustomEvent(EVENT_TOUCH.NOTCH, {
                bubbles: true, detail: { position: position, touches: _event.touches, offset: offset, cardinal: cardinal }
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

    private startGesture(_position: Vector2): void {
      this.posNotch.set(_position.x, _position.y);
      this.posStart.set(_position.x, _position.y);
    }
  }
}