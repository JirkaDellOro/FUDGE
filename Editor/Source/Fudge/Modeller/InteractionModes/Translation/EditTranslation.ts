namespace Fudge {
  import ƒAid = FudgeAid;
  export class EditTranslation extends AbstractTranslation {
    selection: Array<number>;
    private copyOfSelectedVertices: Map<number, ƒ.Vector3>;

    initialize(): void {
      this.createNormalArrows();
    }
    
    onmousedown(_event: ƒ.EventPointer): void {
      if (!this.selection) 
        return;
      this.dragging = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      this.copyOfSelectedVertices = new Map();
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      for (let vertexIndex of this.selection) {
        this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
      }
    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
      this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      console.log("vertices: " + this.selection);
      if (!this.dragging) 
        return;
      
      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      let newPos: ƒ.Vector3 = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance));
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.editableNode.mtxLocal.translation);
      // console.log("newPos: " + newPos + " | trans: " + this.editableNode.mtxLocal.translation);
      mesh.updatePositionOfVertices(this.selection, diff, this.copyOfSelectedVertices);
      //this.createNormalArrows();
      // for (let selection of this.selection) {
      //   let currentVertex: ƒ.Vector3 = this.copyOfSelectedVertices[selection];
      //   mesh.updatePositionOfVertex(selection, new ƒ.Vector3(currentVertex.x + diff.x, currentVertex.y + diff.y, currentVertex.z + diff.z));
      //   // verts[selection] = currentVertex.x + diff.x;
      //   // verts[selection + 1] = currentVertex.y + diff.y;
      //   // verts[selection + 2] = currentVertex.z + diff.z; 
      // }
      // mesh.vertices = verts;
    }
  }
}