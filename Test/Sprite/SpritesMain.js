var Test_sprites;
(function (Test_sprites) {
    var fc = FudgeCore;
    // import fcAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    const clrWhite = fc.Color.CSS("white");
    let viewport;
    let root;
    async function hndLoad(_event) {
        await createAssets();
        const canvas = document.querySelector("canvas");
        root = new fc.Node("root");
        let node = new fc.Node("TestNode");
        node.addComponent(new fc.ComponentTransform(fc.Matrix4x4.TRANSLATION(fc.Vector3.ZERO())));
        //root.addChild(node);
        let spriteObject = new Test_sprites.SpriteObject("spriteObject");
        root.addChild(spriteObject);
        /**********createMesh**********/
        let mesh = new fc.MeshCube();
        let cmpMesh = new fc.ComponentMesh(mesh);
        node.addComponent(cmpMesh);
        let mtrSolidWhite = new fc.Material("SolidWhite", fc.ShaderUniColor, new fc.CoatColored(clrWhite));
        let cmpMaterial = new fc.ComponentMaterial(mtrSolidWhite);
        node.addComponent(cmpMaterial);
        /*end********createMeshe***********/
        fc.Debug.log(cmpMaterial);
        let cmpCamera = new fc.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(4);
        cmpCamera.mtxPivot.rotateY(180);
        viewport = new fc.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        viewport.draw();
        fc.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
    }
    function hndLoop(_event) {
        viewport.draw();
    }
    async function createAssets() {
        let txtAvatar = new fc.TextureImage();
        await txtAvatar.load("Assets/FUDGE.png");
        let coatSprite = new fc.CoatTextured(clrWhite, txtAvatar);
        Test_sprites.SpriteObject.generateSprites(coatSprite);
    }
})(Test_sprites || (Test_sprites = {}));
//# sourceMappingURL=SpritesMain.js.map