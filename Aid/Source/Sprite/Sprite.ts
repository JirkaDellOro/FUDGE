namespace FudgeAid {
  import ƒ = FudgeCore;

  /**
   * Describes a single frame of a sprite animation
   */
  export class SpriteFrame {
    rectTexture: ƒ.Rectangle;
    pivot: ƒ.Matrix4x4;
    material: ƒ.Material;
    timeScale: number;
  }

  /**
   * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
   */
  export class Sprite {
    private static mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
    public frames: SpriteFrame[] = [];
    public name: string;

    constructor(_name: string) {
      this.name = _name;
    }

    public static getMesh(): ƒ.MeshSprite {
      return Sprite.mesh;
    }

    /**
     * Creates a series of frames for this [[Sprite]] resulting in pivot matrices and materials to use on a sprite node
     */
    public generate(_spritesheet: ƒ.TextureImage, _rects: ƒ.Rectangle[], _resolutionQuad: number, _origin: ƒ.ORIGIN2D): void {
      this.frames = [];
      let framing: ƒ.FramingScaled = new ƒ.FramingScaled();
      framing.setScale(1 / _spritesheet.image.width, 1 / _spritesheet.image.height);

      let count: number = 0;
      for (let rect of _rects) {
        let frame: SpriteFrame = this.createFrame(this.name + `${count}`, _spritesheet, framing, rect, _resolutionQuad, _origin);
        frame.timeScale = 1;
        this.frames.push(frame);

        count++;
      }
    }

    /**
     * Generate sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames,
     * the size of the borders of the grid and more
     */
    public generateByGrid(_texture: ƒ.TextureImage, _startRect: ƒ.Rectangle, _frames: number, _borderSize: ƒ.Vector2, _resolutionQuad: number, _origin: ƒ.ORIGIN2D): void {
      let rect: ƒ.Rectangle = _startRect.copy;
      let rects: ƒ.Rectangle[] = [];
      while (_frames--) {
        rects.push(rect.copy);
        rect.position.x += _startRect.size.x + _borderSize.x;

        if (rect.right < _texture.image.width)
          continue;

        _startRect.position.y += _startRect.size.y + _borderSize.y;
        rect = _startRect.copy;
        if (rect.bottom > _texture.image.height)
          break;
      }

      rects.forEach((_rect: ƒ.Rectangle) => ƒ.Debug.log(_rect.toString()));
      this.generate(_texture, rects, _resolutionQuad, _origin);
    }

    private createFrame(_name: string, _texture: ƒ.TextureImage, _framing: ƒ.FramingScaled, _rect: ƒ.Rectangle, _resolutionQuad: number, _origin: ƒ.ORIGIN2D): SpriteFrame {
      let rectTexture: ƒ.Rectangle = new ƒ.Rectangle(0, 0, _texture.image.width, _texture.image.height);
      let frame: SpriteFrame = new SpriteFrame();

      frame.rectTexture = _framing.getRect(_rect);
      frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);

      let rectQuad: ƒ.Rectangle = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
      frame.pivot = ƒ.Matrix4x4.IDENTITY();
      frame.pivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
      frame.pivot.scaleX(rectQuad.size.x);
      frame.pivot.scaleY(rectQuad.size.y);
      // ƒ.Debug.log(rectQuad.toString());

      //TODO: instead of creating many materials, the shader could calculate the texturing
      let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
      coat.pivot.translate(frame.rectTexture.position);
      coat.pivot.scale(frame.rectTexture.size);
      coat.name = _name;
      coat.texture = _texture;

      frame.material = new ƒ.Material(_name, ƒ.ShaderTexture, coat);

      return frame;
    }
  }
}