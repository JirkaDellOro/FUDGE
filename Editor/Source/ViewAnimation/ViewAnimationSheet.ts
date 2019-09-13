namespace FudgeViewAnimation {
  export abstract class ViewAnimationSheet {
    scale: FudgeCore.Vector2;
    abstract updateView(): void;
    abstract scroll(): void;

  }
}