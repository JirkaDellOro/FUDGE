namespace Fudge {
  export class Extrude extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.EXTRUDE;
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;
    private isExtruded: boolean = false;
    private distance: number;
    private copyOfSelectedVertices: Map<number, ƒ.Vector3>;

    onmousedown(_event: ƒ.EventPointer): string {
      if (!this.selection)
        return;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let state: string = mesh.getState();
      this.selection = mesh.extrude(this.selection);
      this.isExtruded = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      this.copyOfSelectedVertices = new Map();
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      for (let vertexIndex of this.selection) {
        this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
      }
      return state;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (!this.isExtruded)
        return;
      this.isExtruded = false;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
      this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.isExtruded) 
        return;

      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      // TODO fix this later
      //mesh.updatePositionOfVertices(this.selection, this.translateVertices(_event, this.distance), this.copyOfSelectedVertices);
    }

    initialize(): void {
      this.createNormalArrows();
    }
    
    cleanup(): void {
      for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
        this.viewport.getGraph().removeChild(node);
      }
    }
    
  }
}