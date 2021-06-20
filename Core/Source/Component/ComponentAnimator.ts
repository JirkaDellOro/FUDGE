// / <reference path="../Time/Loop.ts"/>
// / <reference path="../Animation/Animation.ts"/>

namespace FudgeCore {

  /**
   * Holds a reference to an {@link Animation} and controls it. Controls playback and playmode as well as speed.
   * @authors Lukas Scheuerle, HFU, 2019
   */
  export class ComponentAnimator extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAnimator);
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

      Time.game.addEventListener(EVENT.TIME_SCALED, this.updateScale.bind(this));
      this.addEventListener(EVENT.COMPONENT_REMOVE, () => this.activate(false));
      this.addEventListener(EVENT.COMPONENT_ADD, () => {
        this.getContainer().addEventListener(EVENT.CHILD_REMOVE, () => this.activate(false));
        this.activate(true);
      });
    }

    set speed(_s: number) {
      this.speedScale = _s;
      this.updateScale();
    }

    public activate(_on: boolean): void {
      super.activate(_on);
      if (!this.getContainer())
        return;

      if (_on)
        this.getContainer().addEventListener(EVENT.RENDER_PREPARE, this.updateAnimationLoop);
      else
        this.getContainer().removeEventListener(EVENT.RENDER_PREPARE, this.updateAnimationLoop);
    }

    /**
     * Jumps to a certain time in the animation to play from there.
     */
    public jumpTo(_time: number): void {
      this.localTime.set(_time);
      this.lastTime = _time;
      _time = _time % this.animation.totalTime;
      let mutator: Mutator = this.animation.getMutated(_time, this.animation.calculateDirection(_time, this.playmode), this.playback);
      this.getContainer().applyAnimation(mutator);
    }

    /**
     * Returns the current time of the animation, modulated for animation length.
     */
    public getCurrentTime(): number {
      return this.localTime.get() % this.animation.totalTime;
    }

    /**
     * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
     * @param _time the (unscaled) time to update the animation with.
     * @returns a Tupel containing the Mutator for Animation and the playmode corrected time. 
     */
    public updateAnimation(_time: number): [Mutator, number] {
      return this.updateAnimationLoop(null, _time);
    }

    //#region transfer
    public serialize(): Serialization {
      let s: Serialization = super.serialize();
      s["animation"] = this.animation.serialize();
      s["playmode"] = this.playmode;
      s["playback"] = this.playback;
      s["speedScale"] = this.speedScale;
      s["speedScalesWithGlobalSpeed"] = this.speedScalesWithGlobalSpeed;

      s[super.constructor.name] = super.serialize();

      return s;
    }

    public async deserialize(_s: Serialization): Promise<Serializable> {
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
    private updateAnimationLoop = (_e: Event, _time?: number): [Mutator, number] => {
      if (this.animation.totalTime == 0)
        return [null, 0];
      let time: number = _time || this.localTime.get();
      if (this.playback == ANIMATION_PLAYBACK.FRAMEBASED) {
        time = this.lastTime + (1000 / this.animation.fps);
      }
      let direction: number = this.animation.calculateDirection(time, this.playmode);
      time = this.animation.getModalTime(time, this.playmode, this.localTime.getOffset());
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

    /**   MOVED TO ANIMATION, TODO: delete
     * Calculates the actual time to use, using the current playmodes.
     * @param _time the time to apply the playmodes to
     * @returns the recalculated time
     */
    // private applyPlaymodes(_time: number): number {
    //   switch (this.playmode) {
    //     case ANIMATION_PLAYMODE.STOP:
    //       return this.localTime.getOffset();
    //     case ANIMATION_PLAYMODE.PLAYONCE:
    //       if (_time >= this.animation.totalTime)
    //         return this.animation.totalTime - 0.01;     //TODO: this might cause some issues
    //       else return _time;
    //     case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
    //       if (_time >= this.animation.totalTime)
    //         return this.animation.totalTime + 0.01;     //TODO: this might cause some issues
    //       else return _time;
    //     default:
    //       return _time;
    //   }
    // }

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