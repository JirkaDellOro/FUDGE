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
   * 
   * @author Lukas Scheuerle, HFU, 2019
   */
  export interface AnimationEventTrigger {
    [name: string]: number;
  }

  /**
   * Holds an [[Animation]] and controls it.
   * @authors Lukas Scheuerle, HFU, 2019
   */
  export class ComponentAnimator extends Component {
    animation: Animation;
    playmode: ANIMATION_PLAYMODE;
    playback: ANIMATION_PLAYBACK;
    events: AnimationEventTrigger;

    private lastTime: number = 0;
    private startTime: number = 0;
    private timeAtStart: number = 0;

    constructor(_animation: Animation, _playmode: ANIMATION_PLAYMODE, _playback: ANIMATION_PLAYBACK) {
      super();
      this.animation = _animation;
      this.playmode = _playmode;
      this.playback = _playback;

      //TODO: update animation total time when loading a different animation?
      this.animation.calculateTotalTime();
      this.lastTime = 0;
      //TODO: get an individual time class to work with.
      this.jumpTo(0, Date.now()); // <-- remove this when time class is implemented
      //TODO: register updateAnimatioStart() properly into the gameloop
      Loop.addEventListener(EVENT.LOOP_FRAME, this.updateAnimationLoop.bind(this));
    }

    jumpTo(_time: number, _currentTime: number): void {
      _time = this.calculateCurrentTime(_time, this.calculateDirection(_time));
      this.startTime = _time;
      this.timeAtStart = _currentTime;
      if (this.playback != ANIMATION_PLAYBACK.FRAMEBASED)
        this.lastTime = _currentTime;
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
      //TODO: use own time class
      let direction: number = this.calculateDirection(Date.now());
      let time: number = this.calculateCurrentTime(Date.now(), direction);

      this.updateAnimation(time, direction);
    }

    private updateAnimationRastered(): void {
      //TODO: use own time class
      let direction: number = this.calculateDirection(Date.now());
      let time: number = this.calculateCurrentTime(Date.now(), direction);
      time = time - (time % (1000 / this.animation.fps));

      //TODO: possible optimisation: only update animation if next Frame has been reached
      this.updateAnimation(time, direction);
    }

    private updateAnimationFramebased(): void {
      let timePerFrame: number = 1000 / this.animation.fps;
      let time: number = this.lastTime + timePerFrame;
      let direction: number = this.calculateDirection(time);
      time = time % this.animation.totalTime;

      this.updateAnimation(time, direction);
    }

    private updateAnimation(_time: number, _direction: number): void {
      let mutator: Mutator = this.animation.getMutated(_time, _direction);
      this.getContainer().applyAnimation(mutator);
      this.checkEvents(_time, _direction);
      this.lastTime = _time;
    }
    //#endregion

    private calculateCurrentTime(_time: number, _direction: number): number {
      let time: number = ((_time - this.timeAtStart) * _direction + this.startTime) % this.animation.totalTime;
      if (_direction < 0) {
        time += this.animation.totalTime;
      }
      return time;
    }

    private calculateDirection(_time: number): number {
      _time = _time + this.startTime - this.timeAtStart;
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

    private checkEvents(_time: number, _direction: number): void {
      //TODO Catch Events at the beginning & end of the animation
      if (this.playmode == ANIMATION_PLAYMODE.STOP || _direction == 0)
        return;
      for (let name in this.events) {
        if (_direction > 0 && this.lastTime < this.events[name] && this.events[name] < _time
          || _direction < 0 && this.lastTime > this.events[name] && this.events[name] > _time) {
          this.dispatchEvent(new Event(name));
        }
      }
    }
  }
}