namespace Fudge {
  import ƒAid = FudgeAid;
  export class EditTranslation extends AbstractTranslation {
    selection: Array<number>;
    private copyOfSelectedVertices: Map<number, ƒ.Vector3>;
    private offset: ƒ.Vector3;

    initialize(): void {
      this.createNormalArrows();
    }
    
    onmousedown(_event: ƒ.EventPointer): string {
      if (!this.selection) 
        return;
      this.dragging = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      this.offset = this.getDistanceFromRayToCenterOfNode(_event);
      this.copyOfSelectedVertices = new Map();
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      for (let vertexIndex of this.selection) {
        this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
      }
      return mesh.getState();
    }

    onmove(_event: ƒ.EventPointer): void {
      console.log("vertices: " + this.selection);
      if (!this.dragging) 
        return;
      
      let diff: ƒ.Vector3 = this.getDistanceFromRayToCenterOfNode(_event);
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      // console.log("newPos: " + newPos + " | trans: " + this.editableNode.mtxLocal.translation);
      mesh.updatePositionOfVertices(this.selection, this.copyOfSelectedVertices, diff, this.offset);
    }


    private getDistanceFromRayToCenterOfNode(_event: ƒ.EventPointer): ƒ.Vector3 {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      let newPos: ƒ.Vector3 = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance));
      return ƒ.Vector3.DIFFERENCE(newPos, this.editableNode.mtxLocal.translation);
    }
  }
}