namespace FudgeCore {
  export class AnimationSprite extends Animation {
    public static readonly iSubclass: number = Animation.registerSubclass(AnimationSprite);
    public texture: Texture = TextureDefault.texture;
    private idTexture: string;
    private frames: number = 25;
    private wrapAfter: number = 5;
    private start: Vector2 = new Vector2(0, 0);
    private size: Vector2 = new Vector2(80, 80);
    private next: Vector2 = new Vector2(80, 0);
    private wrap: Vector2 = new Vector2(0, 80);

    // TODO: fps should be a parameter too
    constructor(_name: string = "AnimationSprite") { //}, _fps: number = 15) {
      super(_name, {}, 1);
      this.framesPerSecond = this.frames;
      this.create(this.texture, this.frames, this.wrapAfter, this.start, this.size, this.next, this.wrap, this.framesPerSecond);
    }

    public setTexture(_texture: Texture): void {
      this.texture = _texture;
      this.idTexture = _texture.idResource;
    }

    public create(_texture: Texture, _frames: number, _wrapAfter: number, _start: Vector2, _size: Vector2, _next: Vector2, _wrap: Vector2, _framesPerSecond: number) {
      this.setTexture(_texture);
      this.frames = _frames;
      this.wrapAfter = _wrapAfter;
      this.start = _start;
      this.size = _size;
      this.next = _next;
      this.wrap = _wrap;
      this.framesPerSecond = _framesPerSecond;

      let scale: Vector2 = this.getScale();
      let positions: Vector2[] = this.getPositions();

      let xTranslation: AnimationSequence = new AnimationSequence();
      let yTranslation: AnimationSequence = new AnimationSequence();
      let xScale: AnimationSequence = new AnimationSequence();
      let yScale: AnimationSequence = new AnimationSequence();
      xScale.addKey(new AnimationKey(0, scale.x));
      yScale.addKey(new AnimationKey(0, scale.y));

      for (let frame: number = 0; frame <= this.frames; frame++) {
        let time: number = 1000 * frame / this.framesPerSecond;
        let position: Vector2 = positions[Math.min(frame, this.frames - 1)]; //repeat the last key to give the last frame some time
        xTranslation.addKey(new AnimationKey(time, position.x / this.texture.texImageSource.width));//, 0, 0, true))
        yTranslation.addKey(new AnimationKey(time, position.y / this.texture.texImageSource.height));//, 0, 0, true))
      }

      this.animationStructure = {
        "components": {
          "ComponentMaterial": [{
            "mtxPivot": {
              "translation": {
                x: xTranslation,
                y: yTranslation,
              },
              "scaling": {
                x: xScale,
                y: yScale,
              }
            }
          }]
        }
      }

      this.calculateTotalTime();
    }

    public getScale(): Vector2 {
      return new Vector2(
        this.size.x / this.texture.texImageSource.width,
        this.size.y / this.texture.texImageSource.height
      );
    }

    public getPositions(): Vector2[] {
      let iNext: number = 0;
      let iWrap: number = 0;
      let positions: Vector2[] = [];
      for (let frame: number = 0; frame < this.frames; frame++) {
        positions.push(new Vector2(
          this.start.x + iNext * this.next.x + iWrap * this.wrap.x,
          this.start.y + iNext * this.next.y + iWrap * this.wrap.y
        ));

        iNext++
        if (iNext >= this.wrapAfter) {
          iNext = 0;
          iWrap++;
        }
      }
      return positions;
    }

    //#region transfer
    public async mutate(_mutator: Mutator, _selection?: string[], _dispatchMutate?: boolean): Promise<void> {
      super.mutate(_mutator);
      this.create(this.texture, this.frames, this.wrapAfter, this.start, this.size, this.next, this.wrap, this.framesPerSecond);
    }

    public serialize(): Serialization {
      let serialization: Serialization = {};
      serialization.idResource = this.idResource;
      serialization.idTexture = this.idTexture;
      serialization.frames = this.frames;
      serialization.wrapAfter = this.wrapAfter;
      for (let name of ["start", "size", "next", "wrap"])
        serialization[name] = (<Vector2>Reflect.get(this, name)).serialize();

      let animationsStructure: AnimationStructure = this.animationStructure;
      this.animationStructure = {}; // no need to serialize structure
      // let serialization: Serialization = super.serialize();
      serialization[super.constructor.name] = super.serialize();
      this.animationStructure = animationsStructure; // restore existent structure
      return serialization;
    }

    public async deserialize(_s: Serialization): Promise<Serializable> {
      await super.deserialize(_s[super.constructor.name]);
      if (_s.idTexture)
        this.texture = <Texture>await Project.getResource(_s.idTexture);
      else
        this.texture = TextureDefault.texture;

      for (let name of ["start", "size", "next", "wrap"])
        (<Vector2>Reflect.get(this, name)).deserialize(_s[name]);
      this.create(this.texture, _s.frames, _s.wrapAfter, this.start, this.size, this.next, this.wrap, this.framesPerSecond);
      return this;
    }
    //#endregion

    public convertToAnimation(): Animation {
      let animation: Animation = new Animation(this.name, this.animationStructure, this.framesPerSecond);
      return animation;
    }
  }
}