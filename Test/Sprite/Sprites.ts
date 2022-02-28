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
    // setup sprites
    await loadSprites();

    // setup scene
    root = new ƒ.Node("root");

    spriteNode = new ƒAid.NodeSprite("Sprite");
    spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>animations["bounce"]);
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

  async function loadSprites(): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Assets/bounceball.png");

    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(clrWhite, imgSpriteSheet);
    generateSprites(spriteSheet);
  }

  function generateSprites(_spritesheet: ƒ.CoatTextured): void {
    animations = {};
    this.animations = {};
    let name: string = "bounce";
    let sprite: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
    sprite.generateByGrid(ƒ.Rectangle.GET(1, 0, 17, 60), 8, 22, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(20));
    animations[name] = sprite;
  }

  function handleChange(_event: Event): void {
    let value: number = parseInt((<HTMLInputElement>_event.target).value);
    spriteNode.framerate = value;
    console.log("framerate set to: " + value);
  }
}