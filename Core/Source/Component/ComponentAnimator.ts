/// <reference path="Component.ts"/>
namespace FudgeCore {
  /**
   * Holds different playmodes the animation uses to play back its animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export enum ANIMATION_PLAYMODE {
    /**Plays animation in a loop: it restarts once it hit the end.*/
    LOOP,
    /**Plays animation once and stops at the last key/frame*/
    PLAYONCE,
    /**Plays animation once and stops on the first key/frame */
    PLAYONCESTOPAFTER,
    /**Plays animation like LOOP, but backwards.*/
    REVERSELOOP,
    /**Causes the animation not to play at all. Useful for jumping to various positions in the animation without proceeding in the animation.*/
    STOP
    //TODO: add an INHERIT and a PINGPONG mode
  }

  export enum ANIMATION_PLAYBACK {
    //TODO: add an in-depth description of what happens to the animation (and events) depending on the Playback. Use Graphs to explain.
    /**Calculates the state of the animation at the exact position of time. Ignores FPS value of animation.*/
    TIMEBASED_CONTINOUS,
    /**Limits the calculation of the state of the animation to the FPS value of the animation. Skips frames if needed.*/
    TIMEBASED_RASTERED_TO_FPS,
    /**Uses the FPS value of the animation to advance once per frame, no matter the speed of the frames. Doesn't skip any frames.*/
    FRAMEBASED
  }

  /**
   * Holds a reference to an [[Animation]] and controls it. Controls playback and playmode as well as speed.
   * @authors Lukas Scheuerle, HFU, 2019
   */
  export class ComponentAnimator extends Component {
    //TODO: add functionality to blend from one animation to another.
    animation: Animation;
    playmode: ANIMATION_PLAYMODE;
    playback: ANIMATION_PLAYBACK;
    speedScalesWithGlobalSpeed: boolean = true;

    private localTime: Time;
    private speedScale: number = 1;
    private lastTime: number = 0;

    constructor(_animation: Animation = new Animation(""), _playmode: ANIMATION_PLAYMODE = ANIMATION_PLAYMODE.LOOP, _playback: ANIMATION_PLAYBACK = ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
      super();
      this.animation = _animation;
      this.playmode = _playmode;
      this.playback = _playback;

      this.localTime = new Time();

      //TODO: update animation total time when loading a different animation?
      this.animation.calculateTotalTime();

      Loop.addEventListener(EVENT.LOOP_FRAME, this.updateAnimationLoop.bind(this));
      Time.game.addEventListener(EVENT.TIME_SCALED, this.updateScale.bind(this));
    }

    set speed(_s: number) {
      this.speedScale = _s;
      this.updateScale();
    }

    /**
     * Jumps to a certain time in the animation to play from there.
     * @param _time The time to jump to
     */
    jumpTo(_time: number): void {
      this.localTime.set(_time);
      this.lastTime = _time;
      _time = _time % this.animation.totalTime;
      let mutator: Mutator = this.animation.getMutated(_time, this.calculateDirection(_time), this.playback);
      this.getContainer().applyAnimation(mutator);
    }

    /**
     * Returns the current time of the animation, modulated for animation length.
     */
    getCurrentTime(): number {
      return this.localTime.get() % this.animation.totalTime;
    }

    /**
     * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
     * @param _time the (unscaled) time to update the animation with.
     * @returns a Tupel containing the Mutator for Animation and the playmode corrected time. 
     */
    updateAnimation(_time: number): [Mutator, number] {
      return this.updateAnimationLoop(null, _time);
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
    /**
     * Updates the Animation.
     * Gets called every time the Loop fires the LOOP_FRAME Event.
     * Uses the built-in time unless a different time is specified.
     * May also be called from updateAnimation().
     */
    private updateAnimationLoop(_e: Event, _time: number): [Mutator, number] {
      if (this.animation.totalTime == 0)
        return [null, 0];
      let time: number = _time || this.localTime.get();
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
        return [mutator, time];
      }
      return [null, time];
    }

    /**
     * Fires all custom events the Animation should have fired between the last frame and the current frame.
     * @param events a list of names of custom events to fire
     */
    private executeEvents(events: string[]): void {
      for (let i: number = 0; i < events.length; i++) {
        this.dispatchEvent(new Event(events[i]));
      }
    }

    /**
     * Calculates the actual time to use, using the current playmodes.
     * @param _time the time to apply the playmodes to
     * @returns the recalculated time
     */
    private applyPlaymodes(_time: number): number {
      switch (this.playmode) {
        case ANIMATION_PLAYMODE.STOP:
          return this.localTime.getOffset();
        case ANIMATION_PLAYMODE.PLAYONCE:
          if (_time >= this.animation.totalTime)
            return this.animation.totalTime - 0.01;     //TODO: this might cause some issues
          else return _time;
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time >= this.animation.totalTime)
            return this.animation.totalTime + 0.01;     //TODO: this might cause some issues
          else return _time;
        default:
          return _time;
      }
    }

    /**
     * Calculates and returns the direction the animation should currently be playing in.
     * @param _time the time at which to calculate the direction
     * @returns 1 if forward, 0 if stop, -1 if backwards
     */
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

    /**
     * Updates the scale of the animation if the user changes it or if the global game timer changed its scale.
     */
    private updateScale(): void {
      let newScale: number = this.speedScale;
      if (this.speedScalesWithGlobalSpeed)
        newScale *= Time.game.getScale();
      this.localTime.setScale(newScale);
    }
    //#endregion
  }
}