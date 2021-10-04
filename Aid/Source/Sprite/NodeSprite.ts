namespace FudgeAid {
  /**
   * Handles the animation cycle of a sprite on a [[Node]]
   */
  export class NodeSprite extends ƒ.Node {
    private static mesh: ƒ.MeshSprite = NodeSprite.createInternalResource();
    public framerate: number = 12; // animation frames per second, single frames can be shorter or longer based on their timescale

    private cmpMesh: ƒ.ComponentMesh;
    private cmpMaterial: ƒ.ComponentMaterial;
    private animation: SpriteSheetAnimation;
    private frameCurrent: number = 0;
    private direction: number = 1;
    private timer: number;

    constructor(_name: string) {
      super(_name);

      this.cmpMesh = new ƒ.ComponentMesh(NodeSprite.mesh);
      // Define coat from the SpriteSheet to use when rendering
      this.cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderTexture, null));
      this.addComponent(this.cmpMesh);
      this.addComponent(this.cmpMaterial);
    }

    private static createInternalResource(): ƒ.MeshSprite {
      let mesh: ƒ.MeshSprite = new ƒ.MeshSprite("Sprite");
      ƒ.Project.deregister(mesh);
      return mesh;
    }

    /**
     * @returns the number of the current frame
     */
    public get getCurrentFrame(): number { return this.frameCurrent; } //ToDo: see if getframeCurrent is problematic

    public setAnimation(_animation: SpriteSheetAnimation): void {
      this.animation = _animation;
      if (this.timer)
        ƒ.Time.game.deleteTimer(this.timer);
      this.showFrame(0);
    }

    /**
     * Show a specific frame of the sequence
     */
    public showFrame(_index: number): void {
      let spriteFrame: SpriteFrame = this.animation.frames[_index];
      this.cmpMesh.mtxPivot = spriteFrame.mtxPivot;
      this.cmpMaterial.mtxPivot = spriteFrame.mtxTexture;
      this.cmpMaterial.material.coat = this.animation.spritesheet;
      this.frameCurrent = _index;
      this.timer = ƒ.Time.game.setTimer(spriteFrame.timeScale * 1000 / this.framerate, 1, this.showFrameNext);
    }

    /**
     * Show the next frame of the sequence or start anew when the end or the start was reached, according to the direction of playing
     */
    public showFrameNext = (_event: ƒ.EventTimer): void => {
      this.frameCurrent = (this.frameCurrent + this.direction + this.animation.frames.length) % this.animation.frames.length;
      this.showFrame(this.frameCurrent);
    }

    /**
     * Sets the direction for animation playback, negativ numbers make it play backwards.
     */
    public setFrameDirection(_direction: number): void {
      this.direction = Math.floor(_direction);
    }

    
  }
}