namespace FudgeCore {
  export class AnimationSprite extends Animation {
    public static readonly iSubclass: number = Animation.registerSubclass(AnimationSprite);
    // private resolution: number = 80;
    // private origin: ORIGIN2D = ORIGIN2D.BOTTOMCENTER;
    public texture: Texture = TextureDefault.texture;
    private frames: number = 25;
    private wrapAfter: number = 5;
    private start: Vector2 = new Vector2(0, 0);
    private size: Vector2 = new Vector2(80, 80);
    private next: Vector2 = new Vector2(80, 0);
    private wrap: Vector2 = new Vector2(0, 80);

    // TODO: fps should be a parameter too
    constructor(_name: string = "AnimationSprite") { //}, _fps: number = 15) {
      super(_name, {}, 15);
      this.create(this.texture, this.frames, this.wrapAfter, this.start, this.size, this.next, this.wrap);
    }

    public create(_texture: Texture, _frames: number, _wrapAfter: number, _start: Vector2, _size: Vector2, _next: Vector2, _wrap: Vector2) {
      this.texture = _texture;
      this.frames = _frames;
      this.wrapAfter = _wrapAfter;
      this.start = _start;
      this.size = _size;
      this.next = _next;
      this.wrap = _wrap;

      let positions: Vector2[] = this.getPositions();
      let scale: Vector2 = this.getScale();
    }

    public async mutate(_mutator: Mutator, _selection?: string[], _dispatchMutate?: boolean): Promise<void> {
      super.mutate(_mutator);
      this.create(this.texture, this.frames, this.wrapAfter, this.start, this.size, this.next, this.wrap);
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
  }
}