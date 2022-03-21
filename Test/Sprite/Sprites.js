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
        // setup sprites
        await loadSprites();
        // setup scene
        root = new ƒ.Node("root");
        spriteNode = new ƒAid.NodeSprite("Sprite");
        spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spriteNode.setAnimation(animations["bounce"]);
        spriteNode.setFrameDirection(1);
        spriteNode.mtxLocal.translateY(-1);
        spriteNode.framerate = parseInt(document.querySelector("[name=fps]").value);
        root.addChild(spriteNode);
        // camera setup
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(5);
        cmpCamera.mtxPivot.rotateY(180);
        // setup viewport
        const canvas = document.querySelector("canvas");
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        viewport.camera.clrBackground = ƒ.Color.CSS("White");
        viewport.draw();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);
        document.forms[0].addEventListener("change", handleChange);
    }
    function hndLoop(_event) {
        let avg = document.querySelector("[name=currentframe]");
        avg.value = spriteNode.getCurrentFrame.toString();
        viewport.draw();
    }
    async function loadSprites() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("Assets/bounceball.png");
        let spriteSheet = new ƒ.CoatTextured(clrWhite, imgSpriteSheet);
        generateSprites(spriteSheet);
    }
    function generateSprites(_spritesheet) {
        animations = {};
        this.animations = {};
        let name = "bounce";
        let sprite = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
        sprite.generateByGrid(ƒ.Rectangle.GET(1, 0, 17, 60), 8, 22, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(20));
        animations[name] = sprite;
    }
    function handleChange(_event) {
        let value = parseInt(_event.target.value);
        spriteNode.framerate = value;
        console.log("framerate set to: " + value);
    }
})(Test_sprites || (Test_sprites = {}));
//# sourceMappingURL=Sprites.js.map