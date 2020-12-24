///<reference path="../View/View.ts"/>
///<reference path="../View/Project/ViewExternal.ts"/>
///<reference path="../View/Project/ViewInternal.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;


  export class ControllerVertices extends ƒui.Controller {

    public node: ƒ.Node;
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener("input", this.handleInput); // this should be obsolete
      // this.domElement.addEventListener(ƒui.EVENT.DRAG_OVER, this.hndDragOver);
      // this.domElement.addEventListener(ƒui.EVENT.DROP, this.hndDrop);
      // this.domElement.addEventListener(ƒui.EVENT.UPDATE, this.hndUpdate);
    }





    private handleInput = (_event: Event) => {
      this.mutateOnInput(_event);
      (<ModifiableMesh> this.node.getComponent(ƒ.ComponentMesh).mesh).updateMesh();
    }


  }
}