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
      let typeComponent: string = this.getComponentType(target);
      let viewSource: View = View.getViewSource(_event);
      let typeElement: string = target.parentElement.getAttribute("key");

      if (typeElement == "url" && viewSource instanceof ViewExternal) {
        let selected: DirectoryEntry[] = viewSource.getSelection();
        if (selected.length == 1 && !selected[0].isDirectory) {
          _event.dataTransfer.dropEffect = "link";
          _event.preventDefault();
          _event.stopPropagation();
          console.log(selected[0].name);
        }
      }
    }

    private getComponentType(_target: HTMLElement): string {
      let element: HTMLElement = _target;
      while (element) {
        let type: string = element.getAttribute("type");
        if (type)
          return type;
        element = element.parentElement;
      }

      return undefined;
    }
  }
}