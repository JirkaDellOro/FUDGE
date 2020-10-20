namespace Fudge {
  import ƒ = FudgeCore;
  export class EditSelection extends AbstractSelection {
    selection: Array<number> = [];

    onmousedown(_event: ƒ.EventPointer): void {
      let vertices: Float32Array = this.editableNode.getComponent(ƒ.ComponentMesh).mesh.vertices;
      let nearestVertexIndex: number;
      let shortestDistance: number = Number.MAX_VALUE;

      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      let ray: ƒ.Ray = this.viewport.getRayFromClient(mousePos);

      for (let i: number = 0; i < vertices.length / 2; i += 3) {
        let vertex: ƒ.Vector3 = new ƒ.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        let objTranslation: ƒ.Vector3 = this.editableNode.mtxLocal.translation;
        let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(objTranslation, vertex);
        let distance: number = ray.getDistance(vertexTranslation).magnitude;
        if (distance < shortestDistance && distance < 0.1) {
          shortestDistance = distance;
          nearestVertexIndex = i;
        } 
      }
      if (!nearestVertexIndex) 
        this.selection = [];
      
      this.selection.push(nearestVertexIndex);
      console.log("vertex selected: " + nearestVertexIndex);
    }

    onmouseup(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
  }
}