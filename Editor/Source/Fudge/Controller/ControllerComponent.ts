namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ControllerComponent extends ƒui.Controller {
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener("input", this.mutateOnInput);
      this.domElement.addEventListener(ƒui.EVENT.DRAG_OVER, this.hndDragOver);
    }

    private hndDragOver = (_event: DragEvent): void => {
      let target: HTMLElement = <HTMLElement>_event.target;
      let typeElement: HTMLElement = target;
      while (!typeElement.getAttribute("type"))
       typeElement = typeElement.parentElement;
      if (target.parentElement.getAttribute("key") == "url") {
        console.log(typeElement.getAttribute("type"));
        console.log("URL!");
      }
    }
  }
}