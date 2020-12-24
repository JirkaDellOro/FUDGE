namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class Selector {
    private node: ƒ.Node;
    private cameraPivot: ƒ.Vector3;

    constructor(_node: ƒ.Node, _cameraPivot: ƒ.Vector3) {
      this.node = _node;
      this.cameraPivot = _cameraPivot;
    }


    public selectVertices(_ray: ƒ.Ray, selection: number[]): boolean {
      let mesh: ModifiableMesh = <ModifiableMesh> this.node.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      let nearestVertexIndex: number;
      let shortestDistanceToCam: number = Number.MAX_VALUE;
      let shortestDistanceToRay: number = Number.MAX_VALUE;
      let vertexWasPicked: boolean = false;

      for (let i: number = 0; i < vertices.length; i++) {
        let vertex: ƒ.Vector3 = vertices[i].position;
        let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(this.node.mtxLocal.translation, vertex);
        let distanceToRay: number = _ray.getDistance(vertexTranslation).magnitude;
        let distanceToCam: number = ƒ.Vector3.DIFFERENCE(this.cameraPivot, vertexTranslation).magnitude;
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

      if (vertexWasPicked) {
        if (!ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.CTRL_RIGHT, ƒ.KEYBOARD_CODE.CTRL_LEFT])) {
          selection.splice(0, selection.length);
        }
        selection.push(nearestVertexIndex);

        let event: CustomEvent = new CustomEvent(ƒui.EVENT.CHANGE, { bubbles: true, detail: selection });
        ƒ.EventTargetStatic.dispatchEvent(event);
      }
      return vertexWasPicked;
      // if (!vertexWasPicked) {
      //   this.selection = [];
      // } else {
      //   let wasSelectedAlready: boolean = this.removeSelectedVertexIfAlreadySelected(nearestVertexIndex);
      //   if (!wasSelectedAlready) 
      //     this.selection.push(nearestVertexIndex);
      // }
      // console.log("vertices selected: " + this.selection);
    }

  }
}