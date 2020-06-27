namespace FudgeAid {
  /**
   * Handles the animation cycle of a sprite on a [[Node]]
   */
  export class NodeSprite extends ƒ.Node {
    private static mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
    private cmpMesh: ƒ.ComponentMesh;
    private cmpMaterial: ƒ.ComponentMaterial;
    private sprite: SpriteSheetAnimation;
    private frameCurrent: number = 0;
    private direction: number = 1;

    constructor(_name: string, _sprite: SpriteSheetAnimation) {
      super(_name);
      this.sprite = _sprite;

      this.cmpMesh = new ƒ.ComponentMesh(NodeSprite.mesh);
      // Define coat from the SpriteSheet to use when rendering
      this.cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderTexture, null));
      this.addComponent(this.cmpMesh);
      this.addComponent(this.cmpMaterial);

      this.showFrame(this.frameCurrent);
    }

    /**
     * Show a specific frame of the sequence
     */
    public showFrame(_index: number): void {
      let spriteFrame: SpriteFrame = this.sprite.frames[_index];
      this.cmpMesh.pivot = spriteFrame.mtxPivot;
      this.cmpMaterial.pivot = spriteFrame.mtxTexture;
      this.cmpMaterial.material.setCoat(this.sprite.spritesheet);
      this.frameCurrent = _index;
    }

    /**
     * Show the next frame of the sequence or start anew when the end or the start was reached, according to the direction of playing
     */
    public showFrameNext(): void {
      this.frameCurrent = (this.frameCurrent + this.direction + this.sprite.frames.length) % this.sprite.frames.length;
      this.showFrame(this.frameCurrent);
    }

    /**
     * 
     * @param _direction 
     */
    public setFrameDirection(_direction: number): void {
      this.direction = Math.floor(_direction);
    }
  }
}