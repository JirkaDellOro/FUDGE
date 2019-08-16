/// <reference path="Component.ts"/>
namespace FudgeCore {
  /**
   * Holds different playmodes the animation uses to play back its animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export enum ANIMATION_PLAYMODE {
    LOOP,
    PLAYONCE,
    PLAYONCESTOPAFTER,
    REVERSELOOP,
    STOP
    //TODO: add an INHERIT and a PINGPONG mode
  }

  export enum ANIMATION_PLAYBACK {
    /**Calculates the state of the animation at the exact position of time. Ignores FPS value of animation.*/
    TIMEBASED_CONTINOUS,
    /**Limits the calculation of the state of the animation to the FPS value of the animation. Skips frames if needed.*/
    TIMEBASED_RASTERED_TO_FPS,
    /**Uses the FPS value of the animation to advance once per frame, no matter the speed of the frames. Doesn't skip any frames.*/
    FRAMEBASED
  }

  /**
   * Holds an [[Animation]] and controls it.
   * @authors Lukas Scheuerle, HFU, 2019
   */
  export class ComponentAnimator extends Component {
    animation: Animation;
    playmode: ANIMATION_PLAYMODE;
    playback: ANIMATION_PLAYBACK;
    speedScalesWithGlobalSpeed: boolean = true;

    private localTime: Time;
    private speedScale: number = 1;
    private lastTime: number = 0;
    // private lastFrameTime: number = -1;
    // private lastDirection: number = -10;

    constructor(_animation: Animation = new Animation(""), _playmode: ANIMATION_PLAYMODE = ANIMATION_PLAYMODE.LOOP, _playback: ANIMATION_PLAYBACK = ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
      super();
      this.animation = _animation;
      this.playmode = _playmode;
      this.playback = _playback;

      this.localTime = new Time();

      //TODO: update animation total time when loading a different animation?
      this.animation.calculateTotalTime();

      //TODO: register updateAnimatioStart() properly into the gameloop
      Loop.addEventListener(EVENT.LOOP_FRAME, this.updateAnimationLoop.bind(this));
      Time.game.addEventListener(EVENT.TIME_SCALED, this.updateScale.bind(this));
    }

    set speed(_s: number) {
      this.speedScale = _s;
      this.updateScale();
    }

    jumpTo(_time: number): void {
      // _time = this.calculateCurrentTime(_time, this.calculateDirection(_time));
      this.localTime.set(_time);
      this.lastTime = _time;
      _time = _time % this.animation.totalTime;
      let mutator: Mutator = this.animation.getMutated(_time, this.calculateDirection(_time), this.playback);
      this.getContainer().applyAnimation(mutator);
    }

    //#region transfer
    serialize(): Serialization {
      let s: Serialization = super.serialize();
      s["animation"] = this.animation.serialize();
      s["playmode"] = this.playmode;
      s["playback"] = this.playback;
      s["speedScale"] = this.speedScale;
      s["speedScalesWithGlobalSpeed"] = this.speedScalesWithGlobalSpeed;

      s[super.constructor.name] = super.serialize();

      return s;
    }

    deserialize(_s: Serialization): Serializable {
      this.animation = new Animation("");
      this.animation.deserialize(_s.animation);
      this.playback = _s.playback;
      this.playmode = _s.playmode;
      this.speedScale = _s.speedScale;
      this.speedScalesWithGlobalSpeed = _s.speedScalesWithGlobalSpeed;

      super.deserialize(_s[super.constructor.name]);
      return this;
    }
    //#endregion

    //#region updateAnimation
    private updateAnimationLoop(): void {
      if (this.animation.totalTime == 0) debugger;
      // return;
      let time: number = this.localTime.get();
      if (this.playback == ANIMATION_PLAYBACK.FRAMEBASED) {
        time = this.lastTime + (1000 / this.animation.fps);
      }
      let direction: number = this.calculateDirection(time);
      time = this.applyPlaymodes(time);
      this.executeEvents(this.animation.getEventsToFire(this.lastTime, time, this.playback, direction));

      if (this.lastTime != time) {
        this.lastTime = time;
        time = time % this.animation.totalTime;
        let mutator: Mutator = this.animation.getMutated(time, direction, this.playback);
        if (this.getContainer()) {
          this.getContainer().applyAnimation(mutator);
        }
      }
    }

    private executeEvents(events: string[]): void {
      for (let i: number = 0; i < events.length; i++) {
        this.dispatchEvent(new Event(events[i]));
      }
    }

    private applyPlaymodes(_time: number): number {
      switch (this.playmode) {
        case ANIMATION_PLAYMODE.STOP:
          return this.localTime.getOffset();
        case ANIMATION_PLAYMODE.PLAYONCE:
          if (_time >= this.animation.totalTime)
            return this.animation.totalTime - 0.01;     //TODO: this might break
          else return _time;
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time >= this.animation.totalTime)
            return this.animation.totalTime + 0.01;     //TODO: this might break
          else return _time;
        default:
          return _time;
      }
    }

    private calculateDirection(_time: number): number {
      switch (this.playmode) {
        case ANIMATION_PLAYMODE.STOP:
          return 0;
        // case ANIMATION_PLAYMODE.PINGPONG:
        //   if (Math.floor(_time / this.animation.totalTime) % 2 == 0)
        //     return 1;
        //   else
        //     return -1;
        case ANIMATION_PLAYMODE.REVERSELOOP:
          return -1;
        case ANIMATION_PLAYMODE.PLAYONCE:
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time >= this.animation.totalTime) {
            return 0;
          }
        default:
          return 1;
      }
    }

    private updateScale(): void {
      let newScale: number = this.speedScale;
      if (this.speedScalesWithGlobalSpeed)
        newScale *= Time.game.getScale();
      this.localTime.setScale(newScale);
    }
  }
}