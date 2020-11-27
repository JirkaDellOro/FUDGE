namespace Fudge {
  export abstract class AbstractRotation extends IInteractionMode {
    // TODO: maybe get rid of type properties, only useful for debugging anyways
    public readonly type: InteractionMode = InteractionMode.ROTATE;
    viewport: ƒ.Viewport;
    selection: Array<number>;
    editableNode: ƒ.Node;

    // protected pickedCircle: WidgetCircle;
    protected previousIntersection: ƒ.Vector3;
    // protected oldColor: ƒ.Color;
    private axesSelectionHandler: AxesSelectionHandler;

    constructor (viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      super(viewport, editableNode);
    }

    initialize(): void {
      let widget: RotationWidget = new RotationWidget();
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid();
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.axesSelectionHandler = new AxesSelectionHandler(widget);
    }

    onmousedown(_event: ƒ.EventPointer): string {
      this.viewport.createPickBuffers();
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));

      if (this.axesSelectionHandler.isValidSelection()) {
        this.previousIntersection = this.getIntersection(posRender);
      }
      console.log("cross: " + this.viewport.camera.pivot.translation);
      return (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
    }

    onmouseup(_event: ƒ.EventPointer): void {
      // if (!this.axesSelectionHandler.isValidSelection())
      //   return;

      // for (let circle of this.widget.getChildren()) {
      //   if (circle == this.pickedCircle) {
      //     circle.getComponent(ƒ.ComponentMaterial).clrPrimary = this.oldColor;
      //   }
      // }

      // this.pickedCircle = null;
      this.axesSelectionHandler.releaseComponent();
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
      this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.wasPicked && !this.axesSelectionHandler.isSelectedViaKeyboard) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          this.previousIntersection = this.getIntersection(this.getPosRenderFrom(_event));
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }

      let rotationMatrix: ƒ.Matrix4x4 = this.getRotationVector(_event);
      let mesh: ModifiableMesh = <ModifiableMesh>this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.rotateBy(rotationMatrix, (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(), this.selection);
    }

    onkeydown(_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.addAxisOf(_event.key);
    }

    onkeyup(_event: ƒ.EventKeyboard): void {
      this.axesSelectionHandler.removeAxisOf(_event.key);
      (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).updateNormals();
    }

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }

    private getRotationVector(_event: ƒ.EventPointer): ƒ.Matrix4x4 {
      let intersection: ƒ.Vector3 = this.getIntersection(this.getPosRenderFrom(_event));
      let cameraNorm: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(this.viewport.camera.pivot.translation);
      let angle: number = this.getAngle(this.getOrthogonalVector(intersection, cameraNorm), this.getOrthogonalVector(this.previousIntersection, cameraNorm));
      angle = angle * (180 / Math.PI);

      let selectedAxes: Axis[] = this.axesSelectionHandler.getSelectedAxes();
      let rotationMatrix: ƒ.Matrix4x4;
      /*
        TODO: check if we can make this work with multiple axis, but seems very hard to predict and utilize
        maybe free rotate like in blender is a better option
        at the moment the last selected axis is used, maybe find a better solution here too
      */
      switch (selectedAxes[selectedAxes.length - 1]) {
        case Axis.X:
          rotationMatrix = ƒ.Matrix4x4.ROTATION_X(angle);
          break;
        case Axis.Y:
          rotationMatrix = ƒ.Matrix4x4.ROTATION_Y(angle);
          break;
        case Axis.Z:
          rotationMatrix = ƒ.Matrix4x4.ROTATION_Z(angle);
          break;
        default: 
      }
      this.previousIntersection = intersection;
      return rotationMatrix;
    }


    private getIntersection(posRender: ƒ.Vector2): ƒ.Vector3 {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(posRender);
      return ray.intersectPlane((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(), this.viewport.camera.pivot.translation);
    }

    private getAngle(first: ƒ.Vector2, second: ƒ.Vector2): number {
      return Math.atan2(first.x, first.y) - Math.atan2(second.x, second.y);
    }

    private getOrthogonalVector(posAtIntersection: ƒ.Vector3, cameraTranslationNorm: ƒ.Vector3): ƒ.Vector2 {
      // posAtIntersection = ƒ.Vector3.SUM(posAtIntersection, (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid());
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

  }
}