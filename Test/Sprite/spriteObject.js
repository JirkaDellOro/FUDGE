var Test_sprites;
(function (Test_sprites) {
    var fc = FudgeCore;
    var fcAid = FudgeAid;
    class SpriteObject extends fc.Node {
        constructor(_name) {
            super(_name);
            this.addComponent(new fc.ComponentTransform());
            this.mtxLocal.translation = fc.Vector3.ZERO();
            this.tsprite = new fcAid.NodeSprite("Sprite");
            this.tsprite.addComponent(new fc.ComponentTransform());
            this.tsprite.mtxLocal.translation = fc.Vector3.Y(-1);
            this.tsprite.setAnimation(SpriteObject.animations["Idle"]);
            this.tsprite.setFrameDirection(1);
            this.tsprite.framerate = 2;
            this.addChild(this.tsprite);
        }
        static generateSprites(_spritesheet) {
            SpriteObject.animations = {};
            this.animations = {};
            let name = "Idle";
            let sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(10, 10, 30, 40), 5, 22, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(37));
            this.animations[name] = sprite;
        }
    }
    Test_sprites.SpriteObject = SpriteObject;
})(Test_sprites || (Test_sprites = {}));
//# sourceMappingURL=spriteObject.js.map