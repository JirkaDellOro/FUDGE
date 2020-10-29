namespace Fudge {
  import ƒ = FudgeCore;
  export class EditSelection extends AbstractSelection {
    selection: Array<number> = [];

    onmousedown(_event: ƒ.EventPointer): void {
      let vertices: Float32Array = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.vertices;
      let nearestVertexIndex: number;
      let shortestDistance: number = Number.MAX_VALUE;
      let vertexWasPicked: boolean = false;

      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));

      for (let i: number = 0; i < vertices.length / 2; i += 3) {
        let vertex: ƒ.Vector3 = new ƒ.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(this.editableNode.mtxLocal.translation, vertex);
        let distance: number = ray.getDistance(vertexTranslation).magnitude;
        if (distance < shortestDistance && distance < 0.1) {
          vertexWasPicked = true;
          shortestDistance = distance;
          nearestVertexIndex = i;
        } 
      }
      if (!vertexWasPicked) {
        this.selection = [];
      } else {
        let wasSelectedAlready: boolean = this.removeSelectedVertexIfAlreadySelected(nearestVertexIndex);
        if (!wasSelectedAlready) 
          this.selection.push(nearestVertexIndex);
      }

      console.log("vertices selected: " + this.selection);
    }

    onmouseup(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    private removeSelectedVertexIfAlreadySelected(selectedVertex: number): boolean {
      let wasSelectedAlready: boolean = false;
      for (let i: number = 0; i < this.selection.length; i++) {
        if (this.selection[i] == selectedVertex) {
          this.selection.splice(i, 1);
          wasSelectedAlready = true;
        }
      }
      return wasSelectedAlready;
    }

  }
}