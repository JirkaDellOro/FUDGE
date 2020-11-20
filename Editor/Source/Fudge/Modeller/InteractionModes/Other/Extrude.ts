namespace Fudge {
  export class Extrude extends IInteractionMode {
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;
    private isExtruded: boolean = false;
    private distance: number;
    private copyOfSelectedVertices: Map<number, ƒ.Vector3>;

    onmousedown(_event: ƒ.EventPointer): void {
      if (!this.selection)
        return;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      this.selection = mesh.extrude(this.selection);
      this.isExtruded = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      this.copyOfSelectedVertices = new Map();
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      for (let vertexIndex of this.selection) {
        this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
      }

    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.isExtruded = false;
      this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.isExtruded) 
        return;

      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updatePositionOfVertices(this.selection, this.translateVertices(_event, this.distance), this.copyOfSelectedVertices);
    }

    initialize(): void {
      this.createNormalArrows();
    }
    
    cleanup(): void {
    
    }
    
  }
}