// / <reference path="../Time/Loop.ts"/>
// / <reference path="../Animation/Animation.ts"/>

namespace FudgeCore {

  /**
   * Holds a reference to an {@link Animation} and controls it. Controls playback and playmode as well as speed.
   * @authors Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class ComponentAnimator extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAnimator);
    //TODO: add functionality to blend from one animation to another.
    animation: Animation;
    playmode: ANIMATION_PLAYMODE;
    playback: ANIMATION_PLAYBACK;
    scaleWithGameTime: boolean = true;

    #scale: number = 1;
    #timeLocal: Time;
    #previous: number = 0;

    constructor(_animation: Animation = new Animation(""), _playmode: ANIMATION_PLAYMODE = ANIMATION_PLAYMODE.LOOP, _playback: ANIMATION_PLAYBACK = ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
      super();
      this.animation = _animation;
      this.playmode = _playmode;
      this.playback = _playback;

      this.#timeLocal = new Time();

      //TODO: update animation total time when loading a different animation?
      this.animation.calculateTotalTime();

      this.addEventListener(EVENT.COMPONENT_REMOVE, () => this.activate(false));
      this.addEventListener(EVENT.COMPONENT_ADD, () => {
        this.node.addEventListener(EVENT.CHILD_REMOVE, () => this.activate(false));
        this.activate(true);
      });
    }

    public set scale(_scale: number) {
      this.#scale = _scale;
      this.updateScale();
    }

    public get scale(): number {
      return this.#scale;
    }

    /**
     * Returns the current sample time of the animation
     */
     public get time(): number {
      return this.#timeLocal.get() % this.animation.totalTime;
    }

    public activate(_on: boolean): void {
      super.activate(_on);
      if (!this.node)
        return;

      if (_on) {
        Time.game.addEventListener(EVENT.TIME_SCALED, this.updateScale);
        this.node.addEventListener(EVENT.RENDER_PREPARE, this.updateAnimationLoop);
      }
      else {
        Time.game.addEventListener(EVENT.TIME_SCALED, this.updateScale);
        this.node.removeEventListener(EVENT.RENDER_PREPARE, this.updateAnimationLoop);
      }
    }

    /**
     * Jumps to a certain time in the animation to play from there.
     */
    public jumpTo(_time: number): void {
      this.#timeLocal.set(_time);
      this.#previous = _time;
      _time = _time % this.animation.totalTime;
      let mutator: Mutator = this.animation.getMutated(_time, this.animation.calculateDirection(_time, this.playmode), this.playback);
      this.node.applyAnimation(mutator);
    }

    /**
     * Jumps to a certain label in the animation if defined
     */
    public jumpToLabel(_label: string): void {
      let time: number = this.animation.labels[_label];
      if (time)
        this.jumpTo(time);
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
      let serialization: Serialization = super.serialize();
      serialization.idAnimation = this.animation.idResource;
      serialization.playmode = this.playmode;
      serialization.playback = this.playback;
      serialization.scale = this.scale;
      serialization.scaleWithGameTime = this.scaleWithGameTime;
      serialization[super.constructor.name] = super.serialize();

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      this.animation = <Animation>await Project.getResource(_serialization.idAnimation);
      this.playback = _serialization.playback;
      this.playmode = _serialization.playmode;
      this.scale = _serialization.scale;
      this.scaleWithGameTime = _serialization.scaleWithGameTime;

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
      let time: number = _time || this.#timeLocal.get();
      if (this.playback == ANIMATION_PLAYBACK.FRAMEBASED) {
        time = this.#previous + (1000 / this.animation.fps);
      }
      let direction: number = this.animation.calculateDirection(time, this.playmode);
      time = this.animation.getModalTime(time, this.playmode, this.#timeLocal.getOffset());
      this.executeEvents(this.animation.getEventsToFire(this.#previous, time, this.playback, direction));

      if (this.#previous != time) {
        this.#previous = time;
        time = time % this.animation.totalTime;
        let mutator: Mutator = this.animation.getMutated(time, direction, this.playback);
        if (this.node) {
          this.node.applyAnimation(mutator);
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
     * Updates the scale of the animation if the user changes it or if the global game timer changed its scale.
     */
    private updateScale = (): void => {
      let newScale: number = this.#scale;
      if (this.scaleWithGameTime)
        newScale *= Time.game.getScale();
      this.#timeLocal.setScale(newScale);
    }
    //#endregion
  }
}