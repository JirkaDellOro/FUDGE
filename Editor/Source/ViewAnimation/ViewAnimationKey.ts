///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Build/Fudge"/>
namespace FudgeViewAnimation {
  export interface ViewAnimationKey {
    path2D: Path2D;
    animationKey: FudgeCore.AnimationKey;
    sequence: ViewAnimationSequence;
  }

  export interface ViewAnimationSequence {
    sequence: FudgeCore.AnimationSequence;
    element: HTMLElement;
  }
}