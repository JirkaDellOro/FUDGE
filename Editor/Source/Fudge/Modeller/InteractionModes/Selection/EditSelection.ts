namespace Fudge {
  import ƒ = FudgeCore;
  export class EditSelection extends AbstractSelection {
    selection: Array<number> = [];

    initialize(): void {
      
    }

    onmousedown(_event: ƒ.EventPointer): string {
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      let nearestVertexIndex: number;
      let shortestDistanceToCam: number = Number.MAX_VALUE;
      let shortestDistanceToRay: number = Number.MAX_VALUE;
      let vertexWasPicked: boolean = false;

      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));

      for (let i: number = 0; i < vertices.length; i++) {
        let vertex: ƒ.Vector3 = vertices[i].position;
        let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(this.editableNode.mtxLocal.translation, vertex);
        let distanceToRay: number = ray.getDistance(vertexTranslation).magnitude;
        let distanceToCam: number = ƒ.Vector3.DIFFERENCE(this.viewport.camera.pivot.translation, vertexTranslation).magnitude;
        if (distanceToRay < 0.1) {
          vertexWasPicked = true;
          if (distanceToRay - shortestDistanceToRay < -0.05) {
            shortestDistanceToCam = distanceToCam;
            shortestDistanceToRay = distanceToRay;
            nearestVertexIndex = i;  
          } else if (distanceToRay - shortestDistanceToRay < 0.03 && distanceToCam < shortestDistanceToCam) {
            shortestDistanceToCam = distanceToCam;
            shortestDistanceToRay = distanceToRay;
            nearestVertexIndex = i;  
          }
        } 
      }
      if (!vertexWasPicked) {
        this.selection = [];
      } else {
        let wasSelectedAlready: boolean = this.removeSelectedVertexIfAlreadySelected(nearestVertexIndex);
        if (!wasSelectedAlready) 
          this.selection.push(nearestVertexIndex);
      }
      this.drawCircleAtSelection();
      console.log("vertices selected: " + this.selection);
      return null;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      //
    }

    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onkeydown(_event: ƒ.EventKeyboard): string {
      if (_event.key === "Delete") {
        (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).removeFace(this.selection);
        this.selection = [];
      }
      return null;
    }
    onkeyup(_event: ƒ.EventKeyboard): void {
      //
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