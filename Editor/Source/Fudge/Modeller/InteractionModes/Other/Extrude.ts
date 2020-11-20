namespace Fudge {
  export class Extrude extends IInteractionMode {
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    onmousedown(_event: ƒ.EventPointer): void {
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      this.selection = mesh.extrude(this.selection);
      this.createNormalArrows();
    }

    onmouseup(_event: ƒ.EventPointer): void {
    }

    onmove(_event: ƒ.EventPointer): void {

    }

    initialize(): void {
      this.createNormalArrows();
    }
    
    cleanup(): void {
    
    }
    
  }
}