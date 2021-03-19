namespace Test_sprites {
  import fc = FudgeCore;
  // import fcAid = FudgeAid;

  window.addEventListener("load", hndLoad);
  const clrWhite: fc.Color = fc.Color.CSS("white");

  let viewport: fc.Viewport;
  let root: fc.Node;


  async function hndLoad(_event: Event): Promise<void> {
    await createAssets();
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    root = new fc.Node("root");
    let node: fc.Node = new fc.Node("TestNode");

    node.addComponent(new fc.ComponentTransform(fc.Matrix4x4.TRANSLATION(fc.Vector3.ZERO())));
    //root.addChild(node);
    let spriteObject: SpriteObject = new SpriteObject("spriteObject");
    root.addChild(spriteObject);

    /**********createMesh**********/
    let mesh: fc.MeshCube = new fc.MeshCube();
    let cmpMesh: fc.ComponentMesh = new fc.ComponentMesh(mesh);
    node.addComponent(cmpMesh);

    let mtrSolidWhite: fc.Material = new fc.Material("SolidWhite", fc.ShaderUniColor, new fc.CoatColored(clrWhite));
    let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(mtrSolidWhite);
    node.addComponent(cmpMaterial);
    /*end********createMeshe***********/
    fc.Debug.log(cmpMaterial);
    let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
    cmpCamera.mtxPivot.translateZ(4);
    cmpCamera.mtxPivot.rotateY(180);

    viewport = new fc.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);

    viewport.draw();

    fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
    fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
  }
  function hndLoop(_event: Event): void {
    viewport.draw();
  }
  

  async function createAssets(): Promise<void> {
    let txtAvatar: fc.TextureImage = new fc.TextureImage();
    await txtAvatar.load("Assets/FUDGE.png");
    let coatSprite: fc.CoatTextured = new fc.CoatTextured(clrWhite, txtAvatar);
    SpriteObject.generateSprites(coatSprite);

  }

}

