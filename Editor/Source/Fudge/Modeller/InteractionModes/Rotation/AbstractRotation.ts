namespace Fudge {
  export abstract class AbstractRotation extends IInteractionMode {
    // TODO: maybe get rid of type properties, only useful for debugging anyways
    public readonly type: InteractionMode = InteractionMode.ROTATE;
    viewport: ƒ.Viewport;
    selection: Object;
    editableNode: ƒ.Node;
    protected widget: RotationWidget;

    protected pickedCircle: WidgetCircle;
    protected previousIntersection: ƒ.Vector3;
    protected oldColor: ƒ.Color;

    constructor (viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      super(viewport, editableNode);
    }

    initialize(): void {
      let widget: RotationWidget = new RotationWidget();
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = this.editableNode.mtxLocal.translation;
      mtx.rotation = this.editableNode.mtxLocal.rotation;
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.widget = widget;
    }

    onmousedown(_event: ƒ.EventPointer): string {
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
      return (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (!this.pickedCircle)
        return;

      for (let circle of this.widget.getChildren()) {
        if (circle == this.pickedCircle) {
          circle.getComponent(ƒ.ComponentMaterial).clrPrimary = this.oldColor;
        }
      }

      this.pickedCircle = null;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
      this.createNormalArrows();
    }

    protected getRotationVector(_event: ƒ.EventPointer): ƒ.Matrix4x4 {
      let intersection: ƒ.Vector3 = this.getIntersection(this.getPosRenderFrom(_event));
      let cameraNorm: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(this.viewport.camera.pivot.translation);
      let angle: number = this.getAngle(this.getOrthogonalVector(intersection, cameraNorm), this.getOrthogonalVector(this.previousIntersection, cameraNorm));
      angle = angle * (180 / Math.PI);
      // console.log("intersection: " + intersection + " angle: " + angle);
      // console.log("camera: " + cameraNorm);
      // console.log("obj_rot: " + this.editableNode.mtxLocal.rotation);
      let rotationVector: ƒ.Vector3;
      let rotationMatrix: ƒ.Matrix4x4;

      switch (this.pickedCircle.name) {
        case "Z_Rotation":
          rotationVector = new ƒ.Vector3(0, 0, angle);
          rotationMatrix = ƒ.Matrix4x4.ROTATION_Z(angle);
          break;
        case "Y_Rotation":
          rotationVector = new ƒ.Vector3(0, angle, 0);
          rotationMatrix = ƒ.Matrix4x4.ROTATION_Y(angle);
          break;
        case "X_Rotation":
          rotationVector = new ƒ.Vector3(angle, 0, 0);
          rotationMatrix = ƒ.Matrix4x4.ROTATION_X(angle);
          break;
        default: 
          console.log(this.pickedCircle.name);
      }
      this.previousIntersection = intersection;
      //this.editableNode.mtxLocal.rotation = this.widget.mtxLocal.rotation;
      return rotationMatrix;
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

      // swapped signs, should work too
      // - posAtIntersection.y - posAtIntersection.z * cameraTranslationNorm.y, 
      // - posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
      // - posAtIntersection.x * Math.abs(cameraTranslationNorm.z) 
      // + posAtIntersection.x * cameraTranslationNorm.y);
    }

    // abstract onmousedown(_event: ƒ.EventPointer): void;
    // abstract onmouseup(_event: ƒ.EventPointer): void;
    // abstract onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.widget);
    }
  }
}