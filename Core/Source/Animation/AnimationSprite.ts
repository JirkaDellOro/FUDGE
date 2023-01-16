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

      // TODO: texture size must be calculated from material attached to node
      let sizeTexture: Vector2 = new Vector2(400, 400);
      let scale: Vector2 = new Vector2(this.size.x / sizeTexture.x, this.size.y / sizeTexture.y);
      let iNext: number = 0;
      let iWrap: number = 0;

      console.log(scale.toString());
      console.log(this.texture.texImageSource.width, this.texture.texImageSource.height);

      for (let frame: number = 0; frame < this.frames; frame++) {
        let x: number = this.start.x + iNext * this.next.x + iWrap * this.wrap.x;
        let y: number = this.start.y + iNext * this.next.y + iWrap * this.wrap.y;
        iNext++
        if (iNext >= this.wrapAfter) {
          iNext = 0;
          iWrap++;
        }

        console.log(x / sizeTexture.x, y / sizeTexture.y);
      }
    }
  }
}