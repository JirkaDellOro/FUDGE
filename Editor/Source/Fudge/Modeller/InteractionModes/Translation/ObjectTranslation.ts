namespace Fudge {
  import ƒAid = FudgeAid;
  export class ObjectTranslation extends AbstractTranslation {
    private pickedArrow: string;
    private distanceBetweenWidgetPivotAndPointer: ƒ.Vector3;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      super(viewport, editableNode);
    }

    initialize(): void {
      let widget: ƒ.Node = new ƒAid.NodeCoordinateSystem("TranslateWidget");
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = this.editableNode.mtxLocal.translation;
      mtx.rotation = this.editableNode.mtxLocal.rotation;
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.widget = widget;
    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
      this.pickedArrow = null;
    }

    onmousedown(_event: ƒ.EventPointer): void {
      this.viewport.createPickBuffers();
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      let arrowWasPicked: boolean = false;
      let nodeWasPicked: boolean = false;
      for (let hit of this.viewport.pickNodeAt(posRender)) {
        if (hit.zBuffer != 0) {
          let hitIsArrow: boolean = this.isArrow(hit);

          if (hitIsArrow) {
            arrowWasPicked = true;
            this.distanceBetweenWidgetPivotAndPointer = this.distanceBetweenWidgetPivotAndPointer = this.calculateWidgetDistanceFrom(this.getPosRenderFrom(_event));
          }
          
          if (hit.node == this.editableNode) 
            nodeWasPicked = true;
        }
      } 

      if (nodeWasPicked && !arrowWasPicked) {
        this.dragging = true;
        this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      }
    }

    onmove(_event: ƒ.EventPointer): void {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      let newPos: ƒ.Vector3 = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance));
      if (this.dragging) {
        this.editableNode.mtxLocal.translation = newPos;
      } else {
        switch (this.pickedArrow) {
          case "ArrowGreen":
            this.editableNode.mtxLocal.translation = new ƒ.Vector3(
              this.editableNode.mtxLocal.translation.x, 
              newPos.y, // - this.distanceBetweenWidgetPivotAndPointer.y, 
              this.editableNode.mtxLocal.translation.z);
            break;
          case "ArrowRed":
            this.editableNode.mtxLocal.translation = new ƒ.Vector3(
              newPos.x, // + this.distanceBetweenWidgetPivotAndPointer.x, 
              this.editableNode.mtxLocal.translation.y, 
              this.editableNode.mtxLocal.translation.z);
            break;
          case "ArrowBlue":
            this.editableNode.mtxLocal.translation = new ƒ.Vector3(
              this.editableNode.mtxLocal.translation.x, 
              this.editableNode.mtxLocal.translation.y, 
              newPos.z); // + this.distanceBetweenWidgetPivotAndPointer.z);
            break;
        }
        // if (this.pickedArrow == "ArrowGreen") {
        //   this.editableNode.mtxLocal.translation = new ƒ.Vector3(
        //     this.editableNode.mtxLocal.translation.x, 
        //     newPos.y - this.distanceBetweenWidgetPivotAndPointer.y, 
        //     this.editableNode.mtxLocal.translation.z);
            
          // this.distanceBetweenWidgetPivotAndPointer = this.calculateWidgetDistanceFrom(this.getPosRenderFrom(_event));
          //  .y = newPos.y;
          //let translation: number = Math.sin(rot.x) * Math.sin(rot.z) * _event.movementX / randomScale - Math.cos(rot.x) * Math.cos(rot.z) * _event.movementY / randomScale;
          
          //this.editableNode.mtxLocal.translateY(translation);
          // this.widget.mtxLocal.translateY(translation);
        //}
      }
      this.widget.mtxLocal.translation = this.editableNode.mtxLocal.translation;

      // console.log("movementX: " + _event.movementX + " | movementY: " + _event.movementY);
      // console.log("canvas width: " + this.viewport.getCanvas().width + " | height: " + this.viewport.getCanvas().height);
      // console.log("canvasX: " + _event.canvasX + " | canvasY: " + _event.canvasY);
    }

    private isArrow(hit: ƒ.RayHit): boolean {
      let shaftWasPicked: boolean = false;
      for (let arrow of this.widget.getChildren()) {
        for (let child of arrow.getChildren()) {
          if (hit.node == child) {
            this.pickedArrow = arrow.name;
            this.distance = ƒ.Vector3.DIFFERENCE(arrow.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
            shaftWasPicked = true;
          }  
        }
      }
      return shaftWasPicked;
    }

    private calculateWidgetDistanceFrom(_renderPos: ƒ.Vector2): ƒ.Vector3 {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(_renderPos);
      return ƒ.Vector3.DIFFERENCE(this.widget.mtxLocal.translation, ray.intersectPlane(this.widget.mtxLocal.translation, ray.direction));
    }
  }
}