namespace Fudge {
  export class ObjectTranslation extends AbstractTranslation {
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode);
      this.selection = Array.from(Array((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices.length).keys());
      // this.initialize();
    }


    // onmousedown(_event: ƒ.EventPointer): string {
    //   this.viewport.createPickBuffers();
    //   let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
    //   let arrowWasPicked: boolean = false;
    //   let nodeWasPicked: boolean = false;

    //   for (let hit of this.viewport.pickNodeAt(posRender)) {
    //     if (hit.zBuffer != 0) {
    //       let hitIsArrow: boolean = this.isArrow(hit);

    //       if (hitIsArrow) {
    //         arrowWasPicked = true;
    //         this.distanceBetweenWidgetPivotAndPointer = this.distanceBetweenWidgetPivotAndPointer = this.calculateWidgetDistanceFrom(this.getPosRenderFrom(_event));
    //       }
          
    //       if (hit.node == this.editableNode) 
    //         nodeWasPicked = true;

    //       this.isSelected = true;
    //     }
    //   } 
    //   this.copyVerticesAndCalculateDistance(_event);


    //   if (nodeWasPicked && !arrowWasPicked) {
    //     this.dragging = true;
    //   }

    //   this.oldPosition = this.getNewPosition(_event, this.distance)
    //   return (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
    // }

    // onmove(_event: ƒ.EventPointer): void {
    //   if (!this.isSelected)
    //     return;
    //   let newPos: ƒ.Vector3 = this.getNewPosition(_event, this.distance);
    //   if (this.dragging) {
    //     this.updateVertices(_event);
    //   } else {
    //     let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.oldPosition);
    //     switch (this.pickedArrow) {
    //       case "ArrowGreen":
    //         diff.x = 0;
    //         diff.z = 0;
    //         break;
    //       case "ArrowRed":
    //         diff.y = 0;
    //         diff.z = 0;
    //         break;
    //       case "ArrowBlue":
    //         diff.x = 0;
    //         diff.y = 0;
    //         break;
    //     }
    //     let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
    //     mesh.translateVertices(diff, this.selection);
    //   }

    //   this.oldPosition = newPos;
    // }

    // private isArrow(hit: ƒ.RayHit): boolean {
    //   let shaftWasPicked: boolean = false;
    //   for (let arrow of this.widget.getChildren()) {
    //     for (let child of arrow.getChildren()) {
    //       if (hit.node == child) {
    //         this.pickedArrow = arrow.name;
    //         this.distance = ƒ.Vector3.DIFFERENCE(arrow.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
    //         shaftWasPicked = true;
    //       }  
    //     }
    //   }
    //   return shaftWasPicked;
    // }

    // private calculateWidgetDistanceFrom(_renderPos: ƒ.Vector2): ƒ.Vector3 {
    //   let ray: ƒ.Ray = this.viewport.getRayFromClient(_renderPos);
    //   return ƒ.Vector3.DIFFERENCE(this.widget.mtxLocal.translation, ray.intersectPlane(this.widget.mtxLocal.translation, ray.direction));
    // }
  }
}