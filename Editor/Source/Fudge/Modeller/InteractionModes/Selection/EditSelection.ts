namespace Fudge {
  import ƒ = FudgeCore;

  enum SelectionMode {
    VERTEX,
    BOX
  }
  export class EditSelection extends AbstractSelection {
    selection: Array<number> = [];
    private selectionMode: SelectionMode = SelectionMode.VERTEX;
    private boxStart: ƒ.Vector2;

    initialize(): void {
      //
    }

    onmousedown(_event: ƒ.EventPointer): string {
      switch (this.selectionMode) {
        case SelectionMode.VERTEX: 
          let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
          this.selectVertices(ray);
          break;
        case SelectionMode.BOX:
          this.boxStart = new ƒ.Vector2(_event.clientX, _event.clientY);
      }
      console.log(this.selectionMode);
      return null;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (this.selectionMode !== SelectionMode.BOX) 
        return;
      
      let boxEnd: ƒ.Vector2 = new ƒ.Vector2(_event.clientX, _event.clientY);
      let box: ƒ.Rectangle = new ƒ.Rectangle(this.boxStart.x, this.boxStart.y, boxEnd.x - this.boxStart.x, boxEnd.y - this.boxStart.y);

      let uniqueVertices: UniqueVertex[] = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices;
      this.selection = [];
      for (let i: number = 0; i < uniqueVertices.length; i++) {
        if (box.isInside(this.viewport.pointWorldToClient(uniqueVertices[i].position))) {
          this.selection.push(i);
        }
      }
    }

    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onkeydown(_event: ƒ.EventKeyboard): string {
      //let state: string = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
      if (_event.key === "Delete") {
        (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).removeFace(this.selection);
        this.selection = [];
      } else if (_event.key === "l") {
        this.selectionMode = SelectionMode.BOX;
      }
      return null;
    }

    onkeyup(_event: ƒ.EventKeyboard): void {
      //
    }

    private selectVertices(_ray: ƒ.Ray): void {
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      let nearestVertexIndex: number;
      let shortestDistanceToCam: number = Number.MAX_VALUE;
      let shortestDistanceToRay: number = Number.MAX_VALUE;
      let vertexWasPicked: boolean = false;

      for (let i: number = 0; i < vertices.length; i++) {
        let vertex: ƒ.Vector3 = vertices[i].position;
        let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(this.editableNode.mtxLocal.translation, vertex);
        let distanceToRay: number = _ray.getDistance(vertexTranslation).magnitude;
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
      console.log("vertices selected: " + this.selection);

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