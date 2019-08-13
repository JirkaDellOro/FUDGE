/// <reference path="Component.ts"/>
namespace Fudge {
  /**
   * Holds different playmodes the animation uses to play back its animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export enum ANIMATION_PLAYMODE {
    INHERIT,
    LOOP,
    PINGPONG,
    PLAYONCE,
    PLAYONCESTOPAFTER,
    REVERSELOOP,
    STOP
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
    time: Time;
    speedScalesWithGlobalSpeed: boolean = true;

    private speedScale: number = 1;
    private lastTime: number = -1;
    private lastFrameTime: number = -1;
    // private lastDirection: number = 0;
    // private startTime: number = 0;
    // private timeAtStart: number = 0;

    constructor(_animation: Animation, _playmode: ANIMATION_PLAYMODE, _playback: ANIMATION_PLAYBACK) {
      super();
      this.animation = _animation;
      this.playmode = _playmode;
      this.playback = _playback;

      this.time = new Time();

      //TODO: update animation total time when loading a different animation?
      this.animation.calculateTotalTime();
      this.lastFrameTime = - (1000 / this.animation.fps);
      this.jumpTo(0, 0);

      //TODO: register updateAnimatioStart() properly into the gameloop
      Loop.addEventListener(EVENT.LOOP_FRAME, this.updateAnimationLoop.bind(this));
      Time.game.addEventListener(EVENT.TIME_SCALED, this.updateScale.bind(this));
    }

    set speed(_s: number) {
      this.speedScale = _s;
      this.updateScale();
    }

    jumpTo(_time: number, _currentTime: number): void {
      _time = this.calculateCurrentTime(_time, this.calculateDirection(_time));
      //TODO: maybe this can be outsourced to the time class as well.
      this.time.set(_time);
      // this.startTime = _time;
      // this.timeAtStart = _currentTime;
      // if (this.playback != ANIMATION_PLAYBACK.FRAMEBASED)
      //   this.lastTime = _currentTime;
    }

    //#region updateAnimation
    private updateAnimationLoop(): void {
      switch (this.playback) {
        case ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS:
          this.updateAnimationContinous();
          break;
        case ANIMATION_PLAYBACK.TIMEBASED_RASTERED_TO_FPS:
          this.updateAnimationRastered();
          break;
        case ANIMATION_PLAYBACK.FRAMEBASED:
          this.updateAnimationFramebased();
          break;
      }
    }

    private updateAnimationContinous(): void {
      let time: number = this.time.get();
      let direction: number = this.calculateDirection(time);
      time = this.calculateCurrentTime(time, direction);

      this.updateAnimation(time, direction);
      //TODO: fix backwards and PINGPONG
      this.checkEventBetween(this.lastTime, time);
      this.lastTime = time;
    }

    private updateAnimationRastered(): void {
      let time: number = this.time.get();
      //TODO: fix backwards and PINGPONG
      let direction: number = this.calculateDirection(time);
      time = this.calculateCurrentTime(time, direction);
      let timePerFrame: number = 1000 / this.animation.fps;
      time = time - (time % timePerFrame);
      if (this.lastFrameTime != time) {
        // TODO: possible optimisation: only update animation if next Frame has been reached
        this.updateAnimation(time, direction);
        this.checkEventBetween(time, time + timePerFrame);
        this.lastFrameTime = time;
      }
    }

    private updateAnimationFramebased(): void {
      let timePerFrame: number = 1000 / this.animation.fps;
      let time: number = this.lastFrameTime + timePerFrame;
      let direction: number = this.calculateDirection(time);
      time = time % this.animation.totalTime;

      //TODO: fix backwards and PINGPONG
      // if(direction < 0) {
      //   let newTime: number = this.animation.totalTime
      // }

      this.updateAnimation(time, direction);
      this.checkEventBetween(time, time + timePerFrame);
      // console.log(time)


      this.lastFrameTime = time;
    }

    private updateAnimation(_time: number, _direction: number): void {
      let mutator: Mutator = this.animation.getMutated(_time, _direction);
      this.getContainer().applyAnimation(mutator);
      // this.checkEvents(_time, _direction);
    }
    //#endregion

    private calculateCurrentTime(_time: number, _direction: number): number {
      let time: number = _time % this.animation.totalTime;
      if (_direction < 0) {
        time = this.animation.totalTime - time;
      }
      return time;
    }

    private calculateDirection(_time: number): number {
      // _time = _time + this.startTime - this.timeAtStart;
      switch (this.playmode) {
        case ANIMATION_PLAYMODE.STOP:
          return 0;
        case ANIMATION_PLAYMODE.PINGPONG:
          if (Math.floor(_time / this.animation.totalTime) % 2 == 0)
            return 1;
          else
            return -1;
        case ANIMATION_PLAYMODE.REVERSELOOP:
          return -1;
        case ANIMATION_PLAYMODE.PLAYONCE:
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time > this.animation.totalTime) {
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
      this.time.setScale(newScale);
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

    private checkEventBetween(_min: number, _max: number): void {
      if (_min > _max) {
        // let t: number = _min;
        // _min = _max;
        // _max = t;
        this.checkEventBetween(0, _min);
        this.checkEventBetween(_max, this.animation.totalTime);
      }
      for (let name in this.animation.events) {
        if (_min <= this.animation.events[name] && this.animation.events[name] <= _max) {
          console.log(_min, this.animation.events[name], _max, this.time.get());
          this.dispatchEvent(new Event(name));
        }
      }
    }
  }
}