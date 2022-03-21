namespace FudgeAid {
  import ƒ = FudgeCore;

  /**
   * Describes a single frame of a sprite animation
   */
  export class SpriteFrame {
    rectTexture: ƒ.Rectangle;
    mtxPivot: ƒ.Matrix4x4;
    mtxTexture: ƒ.Matrix3x3;
    timeScale: number;
  }

  /**
   * Convenience for creating a [[CoatTexture]] to use as spritesheet
   */
  export function createSpriteSheet(_name: string, _image: HTMLImageElement): ƒ.CoatTextured {
    let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
    let texture: ƒ.TextureImage = new ƒ.TextureImage();
    texture.image = _image;
    coat.texture = texture;
    return coat;
  }

  /**
   * Holds SpriteSheetAnimations in an associative hierarchical array
   */
  export interface SpriteSheetAnimations {
    [key: string]: SpriteSheetAnimation | SpriteSheetAnimations;
  }

  /**
   * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
   * Contains the [[MeshSprite]], the [[Material]] and the spritesheet-texture
   */
  export class SpriteSheetAnimation {
    public frames: SpriteFrame[] = [];
    public name: string;
    public spritesheet: ƒ.CoatTextured;

    constructor(_name: string, _spritesheet: ƒ.CoatTextured) {
      this.name = _name;
      this.spritesheet = _spritesheet;
    }

    /**
     * Stores a series of frames in this [[Sprite]], calculating the matrices to use in the components of a [[NodeSprite]]
     */
    public generate(_rects: ƒ.Rectangle[], _resolutionQuad: number, _origin: ƒ.ORIGIN2D): void {
      let img: TexImageSource = this.spritesheet.texture.texImageSource;
      this.frames = [];
      let framing: ƒ.FramingScaled = new ƒ.FramingScaled();
      framing.setScale(1 / img.width, 1 / img.height);

      let count: number = 0;
      for (let rect of _rects) {
        let frame: SpriteFrame = this.createFrame(this.name + `${count}`, framing, rect, _resolutionQuad, _origin);
        frame.timeScale = 1;
        this.frames.push(frame);

        count++;
      }
    }

    /**
     * Add sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames, 
     * the resolution which determines the size of the sprites mesh based on the number of pixels of the texture frame,
     * the offset from one cell of the grid to the next in the sequence and, in case the sequence spans over more than one row or column,
     * the offset to move the start rectangle when the margin of the texture is reached and wrapping occurs.
     */
    public generateByGrid(_startRect: ƒ.Rectangle, _frames: number, _resolutionQuad: number, _origin: ƒ.ORIGIN2D, _offsetNext: ƒ.Vector2, _offsetWrap: ƒ.Vector2 = ƒ.Vector2.ZERO()): void {
      let img: TexImageSource = this.spritesheet.texture.texImageSource;
      let rectImage: ƒ.Rectangle = new ƒ.Rectangle(0, 0, img.width, img.height);
      let rect: ƒ.Rectangle = _startRect.clone;
      let rects: ƒ.Rectangle[] = [];
      while (_frames--) {
        rects.push(rect.clone);
        rect.position.add(_offsetNext);

        if (rectImage.covers(rect))
          continue;

        _startRect.position.add(_offsetWrap);
        rect = _startRect.clone;
        if (!rectImage.covers(rect))
          break;
      }

      rects.forEach((_rect: ƒ.Rectangle) => ƒ.Debug.log(_rect.toString()));
      this.generate(rects, _resolutionQuad, _origin);
    }

    private createFrame(_name: string, _framing: ƒ.FramingScaled, _rect: ƒ.Rectangle, _resolutionQuad: number, _origin: ƒ.ORIGIN2D): SpriteFrame {
      let img: TexImageSource = this.spritesheet.texture.texImageSource;
      let rectTexture: ƒ.Rectangle = new ƒ.Rectangle(0, 0, img.width, img.height);
      let frame: SpriteFrame = new SpriteFrame();

      frame.rectTexture = _framing.getRect(_rect);
      frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);

      let rectQuad: ƒ.Rectangle = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
      frame.mtxPivot = ƒ.Matrix4x4.IDENTITY();
      frame.mtxPivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
      frame.mtxPivot.scaleX(rectQuad.size.x);
      frame.mtxPivot.scaleY(rectQuad.size.y);
      // ƒ.Debug.log(rectQuad.toString());

      frame.mtxTexture = ƒ.Matrix3x3.IDENTITY();
      frame.mtxTexture.translate(frame.rectTexture.position);
      frame.mtxTexture.scale(frame.rectTexture.size);

      return frame;
    }
  }
}