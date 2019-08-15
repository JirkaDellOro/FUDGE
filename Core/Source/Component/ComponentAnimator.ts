/// <reference path="Component.ts"/>
namespace Fudge {
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
    localTime: Time;
    speedScalesWithGlobalSpeed: boolean = true;

    private speedScale: number = 1;
    private lastTime: number = 0;
    // private lastFrameTime: number = -1;
    // private lastDirection: number = -10;

    constructor(_animation: Animation, _playmode: ANIMATION_PLAYMODE, _playback: ANIMATION_PLAYBACK) {
      super();
      this.animation = _animation;
      this.playmode = _playmode;
      this.playback = _playback;

      this.localTime = new Time();

      //TODO: update animation total time when loading a different animation?
      this.animation.calculateTotalTime();
      // this.lastFrameTime = - (1000 / this.animation.fps);
      // this.lastDirection = this.calculateDirection(0);
      // this.jumpTo(0);

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

    //#region updateAnimation
    private updateAnimationLoop(): void {
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
        this.getContainer().applyAnimation(mutator);
      }
      
      debugger;

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
    // private updateAnimationLoop(): void {
    //   if (this.playmode == ANIMATION_PLAYMODE.STOP)
    //     return;
    //   switch (this.playback) {
    //     case ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS:
    //       this.updateAnimationContinous();
    //       break;
    //     case ANIMATION_PLAYBACK.TIMEBASED_RASTERED_TO_FPS:
    //       this.updateAnimationRastered();
    //       break;
    //     case ANIMATION_PLAYBACK.FRAMEBASED:
    //       this.updateAnimationFramebased();
    //       break;
    //   }
    // }

    // private updateAnimationContinous(): void {
    //   let time: number = this.time.get();
    //   let direction: number = this.calculateDirection(time);
    //   time = this.calculateCurrentTime(time, direction);

    //   if (this.lastTime == time || this.lastDirection == 0 && direction == 0)
    //     return;

    //   this.updateAnimation(time);

    //   if (this.lastTime < time && (direction > 0)
    //     || this.lastTime > time && (direction < 0)) {
    //     //no timejump
    //     this.checkEventBetween(this.lastTime + 1, time);
    //   } else if (direction == 0) {
    //     //

    //   } else {
    //     //timejump
    //     console.log("Timejump", this.lastTime, time);
    //     let min: number = this.lastTime;
    //     let max: number = time;
    //     if (min > max) {
    //       max = this.lastTime;
    //       min = time;
    //     }
    //     this.checkEventBetween(max + 1, this.animation.totalTime);
    //     this.checkEventBetween(0, min);
    //   }
    //   this.lastTime = time;
    //   this.lastDirection = direction;
    // }

    // private updateAnimationRastered(): void {
    //   let time: number = this.time.get();
    //   let direction: number = this.calculateDirection(time);
    //   time = this.calculateCurrentTime(time, direction);
    //   let timePerFrame: number = 1000 / this.animation.fps;
    //   time = time - (time % timePerFrame);
    //   if (time == this.animation.totalTime)
    //     time = 0;
    //   if (this.lastFrameTime != time) {
    //     this.updateAnimation(time);
    //     this.checkEventBetween(time, time + timePerFrame - 1);
    //     this.lastFrameTime = time;
    //   }
    // }

    // private updateAnimationFramebased(): void {
    //   let timePerFrame: number = 1000 / this.animation.fps;
    //   let direction: number = this.calculateDirection(this.lastTime);
    //   let time: number = this.lastTime;

    //   // if (direction == 0) {
    //   //   if (this.playmode == ANIMATION_PLAYMODE.PLAYONCE || this.playmode == ANIMATION_PLAYMODE.PLAYONCESTOPAFTER) {
    //   //     return;
    //   //   }
    //   // }

    //   time = (this.lastFrameTime + timePerFrame * direction) % this.animation.totalTime;
    //   if (time < 0) {
    //     time += this.animation.totalTime;
    //   }

    //   if (this.lastFrameTime == time || direction == 0)
    //     return;

    //   this.updateAnimation(time);
    //   this.checkEventBetween(time, time + timePerFrame - 1);

    //   this.lastFrameTime = time;
    //   this.lastTime += timePerFrame;
    //   this.lastDirection = direction;
    // }

    // private updateAnimation(_time: number): void {
    //   let mutator: Mutator = this.animation.getMutated(_time);
    //   this.getContainer().applyAnimation(mutator);
    // }
    //#endregion

    // private calculateCurrentTime(_time: number, _direction: number): number {
    //   if (_direction == 0) {
    //     if (this.playmode == ANIMATION_PLAYMODE.PLAYONCE) return this.animation.totalTime;
    //     if (this.playmode == ANIMATION_PLAYMODE.PLAYONCESTOPAFTER) return 0;
    //   }
    //   let time: number = _time % this.animation.totalTime;
    //   if (_direction < 0) {
    //     time = this.animation.totalTime - time;
    //   }
    //   return time;
    // }

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

    // private checkEvents(_time: number, _direction: number): void {
    //   if (_time == this.lastTime)
    //     return;
    //   if (this.playmode == ANIMATION_PLAYMODE.STOP || _direction == 0)
    //     return;
    //   if (this.playmode == ANIMATION_PLAYMODE.PINGPONG) {
    //     if (this.lastDirection == _direction) {
    //       if (_direction > 0) {
    //         this.checkEventBetween(this.lastTime, _time);
    //       } else {
    //         this.checkEventBetween(_time, this.lastTime);
    //       }
    //     } else {
    //       if (_direction > 0) {
    //         this.checkEventBetween(this.lastTime, this.animation.totalTime);
    //         this.checkEventBetween(_time, this.animation.totalTime);
    //       } else {
    //         this.checkEventBetween(0, this.lastTime);
    //         this.checkEventBetween(0, this.animation.totalTime);
    //       }
    //     }
    //     this.lastDirection = _direction;
    //   }
    //   else if (_direction > 0) {
    //     if (this.lastTime < _time) {
    //       this.checkEventBetween(this.lastTime, _time);
    //     } else {
    //       this.checkEventBetween(this.lastTime, this.animation.totalTime);
    //       this.checkEventBetween(0, _time);
    //     }
    //   } else {
    //     if (_time < this.lastTime) {
    //       this.checkEventBetween(_time, this.lastTime);
    //     } else {
    //       this.checkEventBetween(0, this.lastTime);
    //       this.checkEventBetween(_time, this.animation.totalTime);
    //     }
    //   }

    //   this.lastTime = _time;
    // }

    // private checkEventBetween(_min: number, _max: number): void {
    //   _min = Math.floor(_min);
    //   _max = Math.floor(_max);
    //   if (_min > _max) {
    //     let t: number = _min;
    //     _min = _max;
    //     _max = t;
    //   }

    //   // if (2400 < _min && _max < 2600) console.log(_min, _max);
    //   for (let name in this.animation.events) {
    //     if (_min <= this.animation.events[name] && this.animation.events[name] <= _max) {
    //       console.log(_min, this.animation.events[name], _max, this.time.get());
    //       this.dispatchEvent(new Event(name));
    //     }
    //   }
    // }
  }
}