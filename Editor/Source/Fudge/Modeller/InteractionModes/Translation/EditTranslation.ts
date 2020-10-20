namespace Fudge {
  export class EditTranslation extends AbstractTranslation {
    selection: Array<number>;

    onmousedown(_event: ƒ.EventPointer): void {
      this.dragging = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
    }

    onmove(_event: ƒ.EventPointer): void {
      // console.log("vertices: " + this.selection);
      // if (this.dragging) {
      //   let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      //   let diffTranslation: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance)));
      //   //this.editableNode.mtxLocal.translation = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance));
      //   let mesh: ƒ.Mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      //   let verts = mesh.vertices;
      //   for (let selection of this.selection) {
      //     let currentVertex: ƒ.Vector3 = new ƒ.Vector3(verts[selection], verts[selection + 1], verts[selection + 2]);
      //     currentVertex.add(diffTranslation);
      //     verts[selection] = currentVertex.x;
      //     verts[selection + 1] = currentVertex.y;
      //     verts[selection + 2] = currentVertex.z; 
      //   }
      //   mesh.vertices = verts;
      // }
    }
    
  }
}