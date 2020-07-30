namespace Fudge {

  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export enum EVENT_EDITOR {
    REMOVE = "nodeRemoveEvent",
    HIDE = "nodeHideEvent",
    ACTIVEVIEWPORT = "activeViewport"
  }

  export class ComponentController extends ƒui.Controller {
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener("input", this.mutateOnInput);
    }
  }
}