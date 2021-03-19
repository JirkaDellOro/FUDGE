namespace Test_sprites {
  import fc = FudgeCore;
  import fcAid = FudgeAid;

  export class SpriteObject extends fc.Node {
    private static animations: fcAid.SpriteSheetAnimations;
    private tsprite: fcAid.NodeSprite;

    constructor(_name: string) {
      super(_name);
      this.addComponent(new fc.ComponentTransform());
      this.mtxLocal.translation = fc.Vector3.ZERO();
      this.tsprite = new fcAid.NodeSprite("Sprite");
      this.tsprite.addComponent(new fc.ComponentTransform());
      this.tsprite.mtxLocal.translation = fc.Vector3.Y(-1);
      this.tsprite.setAnimation(<fcAid.SpriteSheetAnimation>SpriteObject.animations["Idle"]);
      this.tsprite.setFrameDirection(1);
      this.tsprite.framerate = 2;
      this.addChild(this.tsprite);
    }


    public static generateSprites(_spritesheet: fc.CoatTextured): void {
      SpriteObject.animations = {};
      this.animations = {};
      let name: string = "Idle";
      let sprite: fcAid.SpriteSheetAnimation = new fcAid.SpriteSheetAnimation(name, _spritesheet);
      sprite.generateByGrid(fc.Rectangle.GET(10, 10, 30, 40), 5, 22, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(37));
      this.animations[name] = sprite;

    }

  }
}