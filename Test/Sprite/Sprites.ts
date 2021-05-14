namespace Test_sprites {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", hndLoad);

  const clrWhite: ƒ.Color = ƒ.Color.CSS("white");

  let viewport: ƒ.Viewport;
  let root: ƒ.Node;
  let animations: ƒAid.SpriteSheetAnimations;
  let spriteNode: ƒAid.NodeSprite;

  async function hndLoad(_event: Event): Promise<void> {

    await createAssets();
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    spriteNode = new ƒAid.NodeSprite("Sprite");
    root = new ƒ.Node("root");
    let node: ƒ.Node = new ƒ.Node("TestNode");
    spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    node.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.ZERO())));
    root.addChild(spriteNode);

    spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>animations["bounce"]);
    spriteNode.setFrameDirection(1);
    spriteNode.mtxLocal.translateY(-0.8);
    spriteNode.framerate = 5;

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.mtxPivot.translateZ(4);
    cmpCamera.mtxPivot.rotateY(180);
    
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);
    viewport.camera.clrBackground = ƒ.Color.CSS("White");
    viewport.draw();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, hndLoop);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
  }
  function hndLoop(_event: Event): void {
    viewport.draw();
  }


  async function createAssets(): Promise<void> {
    let txtAvatar: ƒ.TextureImage = new ƒ.TextureImage();
    await txtAvatar.load("Assets/Ball.png");
    let coatSprite: ƒ.CoatTextured = new ƒ.CoatTextured(clrWhite, txtAvatar);
    generateSprites(coatSprite);
  }

  function generateSprites(_spritesheet: ƒ.CoatTextured): void {
    animations = {};
    this.animations = {};
    let name: string = "bounce";
    let sprite: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
    sprite.generateByGrid(ƒ.Rectangle.GET(1, 0, 17, 42), 7, 22, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(20));
    animations[name] = sprite;
  }

}

