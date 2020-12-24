namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;


  enum SelectionMode {
    VERTEX,
    BOX
  }

  export class EditSelection extends AbstractSelection {
    selection: Array<number> = [];
    private selectionMode: SelectionMode = SelectionMode.BOX;
    private boxStart: ƒ.Vector2;
    private clientPos: ƒ.Vector2;
    private vertexSelected: boolean = false;


    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
      // this.initialize();
    }

    initialize(): void {
    }

    onmousedown(_event: ƒ.EventPointer): string {
      if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
        this.vertexSelected = true;
        return;
      }
      this.boxStart = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      this.clientPos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.drawBox);

      // switch (this.selectionMode) {
      //   case SelectionMode.VERTEX: 
      //     let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      //     this.selectVertices(ray);
      //     break;
      //   case SelectionMode.BOX:
      //     this.boxStart = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      //     this.clientPos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      //     ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.drawBox);
      //     break;
      // }
      console.log(this.selectionMode);
      return null;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (this.vertexSelected) {
        this.vertexSelected = false;
        return;
      }
      let boxEnd: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      let box: ƒ.Rectangle = new ƒ.Rectangle(this.boxStart.x, this.boxStart.y, boxEnd.x - this.boxStart.x, boxEnd.y - this.boxStart.y);

      let uniqueVertices: UniqueVertex[] = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices;
      this.selection = [];
      for (let i: number = 0; i < uniqueVertices.length; i++) {
        if (box.isInside(this.viewport.pointWorldToClient(uniqueVertices[i].position))) {
          this.selection.push(i);
        }
      }

      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.drawBox);
    }

    onmove(_event: ƒ.EventPointer): void {
      if (this.selectionMode !== SelectionMode.BOX) 
        return;

      this.clientPos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
    }

    onkeydown(_event: ƒ.EventKeyboard): string {
      let state: string = null;

      switch (_event.key) {
        case "Delete": 
          (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).removeFace(this.selection);
          this.selection = [];
          state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
          break;
        case "l": 
          this.selectionMode = SelectionMode.BOX;
          break;
        case "v":
          this.selectionMode = SelectionMode.VERTEX;
          break;
      }
      return state;
    }

    onkeyup(_event: ƒ.EventKeyboard): void {
      //
    }

    private drawBox = () => {
      let crx2d: CanvasRenderingContext2D = this.viewport.getCanvas().getContext("2d");
      crx2d.strokeStyle = `rgb(220, 220, 220)`;
      crx2d.strokeRect(this.boxStart.x, this.boxStart.y, this.clientPos.x - this.boxStart.x, this.clientPos.y - this.boxStart.y);
    }

    // private selectVertices(_ray: ƒ.Ray): void {
    //   let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
    //   let vertices: UniqueVertex[] = mesh.uniqueVertices;
    //   let nearestVertexIndex: number;
    //   let shortestDistanceToCam: number = Number.MAX_VALUE;
    //   let shortestDistanceToRay: number = Number.MAX_VALUE;
    //   let vertexWasPicked: boolean = false;

    //   for (let i: number = 0; i < vertices.length; i++) {
    //     let vertex: ƒ.Vector3 = vertices[i].position;
    //     let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(this.editableNode.mtxLocal.translation, vertex);
    //     let distanceToRay: number = _ray.getDistance(vertexTranslation).magnitude;
    //     let distanceToCam: number = ƒ.Vector3.DIFFERENCE(this.viewport.camera.pivot.translation, vertexTranslation).magnitude;
    //     if (distanceToRay < 0.1) {
    //       vertexWasPicked = true;
    //       if (distanceToRay - shortestDistanceToRay < -0.05) {
    //         shortestDistanceToCam = distanceToCam;
    //         shortestDistanceToRay = distanceToRay;
    //         nearestVertexIndex = i;  
    //       } else if (distanceToRay - shortestDistanceToRay < 0.03 && distanceToCam < shortestDistanceToCam) {
    //         shortestDistanceToCam = distanceToCam;
    //         shortestDistanceToRay = distanceToRay;
    //         nearestVertexIndex = i;  
    //       }
    //     } 
    //   }
    //   if (!vertexWasPicked) {
    //     this.selection = [];
    //   } else {
    //     let wasSelectedAlready: boolean = this.removeSelectedVertexIfAlreadySelected(nearestVertexIndex);
    //     if (!wasSelectedAlready) 
    //       this.selection.push(nearestVertexIndex);
    //   }
    //   console.log("vertices selected: " + this.selection);
    // }

    // private removeSelectedVertexIfAlreadySelected(selectedVertex: number): boolean {
    //   let wasSelectedAlready: boolean = false;
    //   for (let i: number = 0; i < this.selection.length; i++) {
    //     if (this.selection[i] == selectedVertex) {
    //       this.selection.splice(i, 1);
    //       wasSelectedAlready = true;
    //     }
    //   }
    //   return wasSelectedAlready;
    // }
  }
}