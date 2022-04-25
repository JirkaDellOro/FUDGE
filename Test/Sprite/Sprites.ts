namespace Test_sprites {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", hndLoad);

  const clrWhite: ƒ.Color = ƒ.Color.CSS("white");

  let viewport: ƒ.Viewport;
  
  let spriteNode: ƒAid.NodeSprite;

  async function hndLoad(_event: Event): Promise<void> {
    let root: ƒ.Node = new ƒ.Node("root");

    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Assets/bounceball.png");
    let coat: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet);

    let animation: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("Bounce", coat);
    animation.generateByGrid(ƒ.Rectangle.GET(1, 0, 17, 60), 8, 22, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(20));

    spriteNode = new ƒAid.NodeSprite("Sprite");
    spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteNode.setAnimation(animation);
    spriteNode.setFrameDirection(1);
    spriteNode.mtxLocal.translateY(-1);
    spriteNode.framerate = parseInt((<HTMLInputElement>document.querySelector("[name=fps]")).value);


    root.addChild(spriteNode);

    // camera setup
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.mtxPivot.translateZ(5);
    cmpCamera.mtxPivot.rotateY(180);

    // setup viewport
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);
    viewport.camera.clrBackground = ƒ.Color.CSS("White");
    viewport.draw();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, hndLoop);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);

    document.forms[0].addEventListener("change", handleChange);
  }

  function hndLoop(_event: Event): void {
    let avg: HTMLInputElement = document.querySelector("[name=currentframe]");
    avg.value = spriteNode.getCurrentFrame.toString();

    viewport.draw();
  }

  function handleChange(_event: Event): void {
    let value: number = parseInt((<HTMLInputElement>_event.target).value);
    spriteNode.framerate = value;
    console.log("framerate set to: " + value);
  }
}