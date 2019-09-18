///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Build/Fudge"/>
namespace Fudge {
  export interface ViewAnimationKey {
    path2D: Path2D;
    animationKey: FudgeCore.AnimationKey;
    sequence: ViewAnimationSequence;
  }

  export interface ViewAnimationSequence {
    sequence: FudgeCore.AnimationSequence;
    element: HTMLElement;
  }

  export interface ViewAnimationEvent {
    path2D: Path2D;
    event: string;
  }
  export interface ViewAnimationLabel {
    path2D: Path2D;
    label: string;
  }
}