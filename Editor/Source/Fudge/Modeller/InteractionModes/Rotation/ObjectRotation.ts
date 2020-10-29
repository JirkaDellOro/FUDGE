namespace Fudge {
  import ƒ = FudgeCore;
  export class ObjectRotation extends AbstractRotation {
    selection: ƒ.Node;
    private pickedCircle: WidgetCircle;
    private previousIntersection: ƒ.Vector3;
    private oldColor: ƒ.Color;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      super(viewport, editableNode);
      let widget: RotationWidget = new RotationWidget();
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = this.editableNode.mtxLocal.translation;
      mtx.rotation = this.editableNode.mtxLocal.rotation;
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.widget = widget;
    }

    onmousedown(_event: ƒ.EventPointer): void {
      this.viewport.createPickBuffers();
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      let lowestZBuffer: number = Number.MAX_VALUE;
      let wasPicked: boolean = false;
      for (let hit of this.viewport.pickNodeAt(posRender)) {
        if (hit.zBuffer != 0) {
          for (let circle of this.widget.getChildren()) {
            if (circle == hit.node) {
              if (hit.zBuffer > lowestZBuffer) 
                continue;
              wasPicked = true;
              this.pickedCircle = circle;
              lowestZBuffer = hit.zBuffer;
              this.previousIntersection = this.getIntersection(posRender);
            }
          }
        }
      }

      if (wasPicked) {
        this.oldColor = this.pickedCircle.getComponent(ƒ.ComponentMaterial).clrPrimary;
        this.pickedCircle.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1);
      }
      console.log("cross: " + this.viewport.camera.pivot.translation);
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (!this.pickedCircle) 
        return;
      for (let circle of this.widget.getChildren())
      {
        if (circle == this.pickedCircle) {
          circle.getComponent(ƒ.ComponentMaterial).clrPrimary = this.oldColor;
        }
      }

      this.pickedCircle = null;
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.pickedCircle) 
        return;
      let intersection: ƒ.Vector3 = this.getIntersection(this.getPosRenderFrom(_event));
      let cameraNorm: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(this.viewport.camera.pivot.translation);
      let angle: number = this.getAngle(this.getOrthogonalVector(intersection, cameraNorm), this.getOrthogonalVector(this.previousIntersection, cameraNorm));      
      //             new ƒ.Vector2(intersection.y + intersection.z * cameraNorm.y, 
      //               (-intersection.z * cameraNorm.x) + (intersection.x * cameraNorm.z) + (-intersection.x * cameraNorm.y)), 
      // new ƒ.Vector2(this.previousIntersection.y + this.previousIntersection.z * cameraNorm.y,
      //               (-this.previousIntersection.z * cameraNorm.x) + (this.previousIntersection.x * cameraNorm.z) + (-this.previousIntersection.x * cameraNorm.y))); // Math.atan2(intersection.y, intersection.x) - Math.atan2(this.previousIntersection.y, this.previousIntersection.x);
  
      angle = angle * (180 / Math.PI);
      console.log("inter: " + intersection + " angle: " + angle);
      console.log("camera: " + cameraNorm);
      console.log("obj_rot: " + this.editableNode.mtxLocal.rotation);
      switch (this.pickedCircle.name) {
        case "Z_Rotation":
          this.widget.mtxLocal.rotateZ(angle);
          break;
        case "Y_Rotation":
          this.widget.mtxLocal.rotateY(angle);
          break;
        case "X_Rotation":
          this.widget.mtxLocal.rotateX(angle);
          break;
      }
      this.editableNode.mtxLocal.rotation = this.widget.mtxLocal.rotation;
      this.previousIntersection = intersection;
    }

    private getIntersection(posRender: ƒ.Vector2): ƒ.Vector3 {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(posRender);
      return ray.intersectPlane(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation);
    }

    private getAngle(first: ƒ.Vector2, second: ƒ.Vector2): number {
      return Math.atan2(first.x, first.y) - Math.atan2(second.x, second.y);
    }

    private getOrthogonalVector(posAtIntersection: ƒ.Vector3, cameraTranslationNorm: ƒ.Vector3): ƒ.Vector2 {
      return new ƒ.Vector2(
        + posAtIntersection.y + posAtIntersection.z * cameraTranslationNorm.y, 
        + posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
        - posAtIntersection.x * Math.abs(cameraTranslationNorm.z) 
        + posAtIntersection.x * cameraTranslationNorm.y);
        // posAtIntersection.y + posAtIntersection.z * cameraTranslationNorm.y, 
        // (-posAtIntersection.z * cameraTranslationNorm.x) + (posAtIntersection.x * cameraTranslationNorm.z) + (-posAtIntersection.x * cameraTranslationNorm.y));
        // (Math.abs(objrotation.y) > 90 ? posAtIntersection.z * Math.abs(cameraTranslationNorm.x) : - posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
        
        // (cameraTranslationNorm.x > 0 ? -(posAtIntersection.z * cameraTranslationNorm.x) : (posAtIntersection.z * cameraTranslationNorm.x))
        // (cameraTranslationNorm.z > 0 ? (posAtIntersection.x * cameraTranslationNorm.z) : -(posAtIntersection.x * cameraTranslationNorm.z))
      
      
        // - posAtIntersection.y - posAtIntersection.z * cameraTranslationNorm.y, 
        // - posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
        // - posAtIntersection.x * Math.abs(cameraTranslationNorm.z) 
        // + posAtIntersection.x * cameraTranslationNorm.y);

      }
  }
}