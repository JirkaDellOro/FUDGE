namespace Fudge {
  import ƒ = FudgeCore;

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

      for (let index: number = 0; index < vertices.length; index++) {
        let vertex: ƒ.Vector3 = vertices[index].position;
        let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(this.node.mtxWorld.translation, vertex);
        let distanceToRay: number = _ray.getDistance(vertexTranslation).magnitude;
        let distanceToCam: number = ƒ.Vector3.DIFFERENCE(this.cameraPivot, vertexTranslation).magnitude;
        if (distanceToRay < 0.1) {
          vertexWasPicked = true;
          if (distanceToRay - shortestDistanceToRay < -0.05) {
            updateValues();
          } else if (distanceToRay - shortestDistanceToRay < 0.03 && distanceToCam < shortestDistanceToCam) {
            updateValues();
          }
          
          function updateValues(): void {
            shortestDistanceToCam = distanceToCam;
            shortestDistanceToRay = distanceToRay;
            nearestVertexIndex = index;  
          }
        } 
      }

      if (vertexWasPicked) {
        if (!ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.CTRL_RIGHT, ƒ.KEYBOARD_CODE.CTRL_LEFT])) {
          selection.splice(0, selection.length);
        }
        let vertexAlreadySelected: boolean = false;
        for (let selectedIndex of selection) {
          if (selectedIndex === nearestVertexIndex) 
            vertexAlreadySelected = true;
        }
        if (!vertexAlreadySelected)
          selection.push(nearestVertexIndex);

        let event: CustomEvent = new CustomEvent(MODELLER_EVENTS.SELECTION_UPDATE, { bubbles: true, detail: {selection: selection, vertices: mesh.uniqueVertices }});
        ƒ.EventTargetStatic.dispatchEvent(event);
      }
      return vertexWasPicked;
    }
  }
}