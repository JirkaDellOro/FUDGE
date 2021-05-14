var Test_sprites;
(function (Test_sprites) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    const clrWhite = ƒ.Color.CSS("white");
    let viewport;
    let root;
    let animations;
    let spriteNode;
    async function hndLoad(_event) {
        await createAssets();
        const canvas = document.querySelector("canvas");
        spriteNode = new ƒAid.NodeSprite("Sprite");
        root = new ƒ.Node("root");
        let node = new ƒ.Node("TestNode");
        spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        node.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.ZERO())));
        root.addChild(spriteNode);
        spriteNode.setAnimation(animations["bounce"]);
        spriteNode.setFrameDirection(1);
        spriteNode.mtxLocal.translateY(-0.8);
        spriteNode.framerate = 5;
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(4);
        cmpCamera.mtxPivot.rotateY(180);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        viewport.camera.clrBackground = ƒ.Color.CSS("White");
        viewport.draw();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
    }
    function hndLoop(_event) {
        viewport.draw();
    }
    async function createAssets() {
        let txtAvatar = new ƒ.TextureImage();
        await txtAvatar.load("Assets/Ball.png");
        let coatSprite = new ƒ.CoatTextured(clrWhite, txtAvatar);
        generateSprites(coatSprite);
    }
    function generateSprites(_spritesheet) {
        animations = {};
        this.animations = {};
        let name = "bounce";
        let sprite = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
        sprite.generateByGrid(ƒ.Rectangle.GET(1, 0, 17, 42), 7, 22, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(20));
        animations[name] = sprite;
    }
})(Test_sprites || (Test_sprites = {}));
//# sourceMappingURL=Sprites.js.map