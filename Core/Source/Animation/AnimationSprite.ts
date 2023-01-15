namespace FudgeCore {
  export class AnimationSprite extends Animation {
    public static readonly iSubclass: number = Animation.registerSubclass(AnimationSprite);
    private resolution: number = 80;
    // private origin: ORIGIN2D = ORIGIN2D.BOTTOMCENTER;
    private frames: number = 25;
    private grid: Vector2 = new Vector2(5,5);
    private start: Vector2 = new Vector2(0,0);
    private size: Vector2 = new Vector2(80,80);
    private next: Vector2 = new Vector2(80,0);
    private wrap: Vector2 = new Vector2(0,80);

    constructor(_name: string = "AnimationSprite", _fps: number = 15) {
      super(_name, {}, _fps);

    }
  }
}