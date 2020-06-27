namespace FudgeAid {
  /**
   * Handles the animation cycle of a sprite on a [[Node]]
   */
  export class NodeSprite extends ƒ.Node {
    private cmpMesh: ƒ.ComponentMesh;
    private cmpMaterial: ƒ.ComponentMaterial;
    private sprite: Sprite;
    private frameCurrent: number = 0;
    private direction: number = 1;

    constructor(_name: string, _sprite: Sprite) {
      super(_name);
      this.sprite = _sprite;

      this.cmpMesh = new ƒ.ComponentMesh(Sprite.getMesh());
      this.cmpMaterial = new ƒ.ComponentMaterial();
      this.addComponent(this.cmpMesh);
      this.addComponent(this.cmpMaterial);

      this.showFrame(this.frameCurrent);
    }

    /**
     * Show a specific frame of the sequence
     */
    public showFrame(_index: number): void {
      let spriteFrame: SpriteFrame = this.sprite.frames[_index];
      this.cmpMesh.pivot = spriteFrame.pivot;
      this.cmpMaterial.material = spriteFrame.material;
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