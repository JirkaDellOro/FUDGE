namespace Fudge {
  export abstract class AbstractRotation extends IInteractionMode {
    public readonly type: InteractionModes = InteractionModes.ROTATE;
    viewport: ƒ.Viewport;
    selection: Array<number>;
    editableNode: ƒ.Node;

    protected axesSelectionHandler: AxesSelectionHandler;
    private previousMousePos: ƒ.Vector2;


    initialize(): void {
      let widget: RotationWidget = new RotationWidget();
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.axesSelectionHandler = new AxesSelectionHandler(widget);
    }

    onmousedown(_event: ƒ.EventPointer): void {
      this.viewport.createPickBuffers();
      let posRender: ƒ.Vector2 = this.getPosRenderFrom(_event);
      this.previousMousePos = new ƒ.Vector2(_event.clientX, _event.clientY);
      this.axesSelectionHandler.pickWidget(this.viewport.pickNodeAt(posRender));
      let state: string = null;
      // if (this.axesSelectionHandler.wasPicked) 
      //   state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
      // return state;
    }

    onmouseup(_event: ƒ.EventPointer): string {
      let state: string = null;
      if (this.axesSelectionHandler.wasPicked) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.axesSelectionHandler.releaseComponent();
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
      // this.createNormalArrows();
      return state;
    }

    onmove(_event: ƒ.EventPointer): void {
      if (!this.axesSelectionHandler.isValidSelection()) {
        if (this.axesSelectionHandler.isAxisSelectedViaKeyboard()) {
          this.previousMousePos = new ƒ.Vector2(_event.clientX, _event.clientY);
          this.axesSelectionHandler.isSelectedViaKeyboard = true;
        }
        return;
      }

      let rotationMatrix: ƒ.Matrix4x4 = this.getRotationMatrix(_event);
      let mesh: ModifiableMesh = <ModifiableMesh>this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.rotateBy(rotationMatrix, this.axesSelectionHandler.widget.mtxLocal.translation, this.selection);
    }

    onkeydown(_pressedKey: string): void {
      this.axesSelectionHandler.addAxisOf(_pressedKey)
      // let result: string = null;
      // if (this.axesSelectionHandler.addAxisOf(_pressedKey)) {
      //   result = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();
      // }
    }

    onkeyup(_pressedKey: string): string {
      let state: string = null;
      if (this.axesSelectionHandler.isValidSelection()) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.axesSelectionHandler.removeAxisOf(_pressedKey);
      (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).updateNormals();
      return state;
    }

    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
      return [];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      console.log(_item);
    }

    update(): void {
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
    }

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }

    private getRotationMatrix(_event: ƒ.EventPointer): ƒ.Matrix4x4 {
      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.clientX, _event.clientY);
      let meshCenterClient: ƒ.Vector2 = this.viewport.pointWorldToClient(this.axesSelectionHandler.widget.mtxLocal.translation);
      let newClientPosition: ƒ.Vector2 = new ƒ.Vector2(mousePos.x - meshCenterClient.x, mousePos.y - meshCenterClient.y);
      let oldClientPosition: ƒ.Vector2 = new ƒ.Vector2(this.previousMousePos.x - meshCenterClient.x, this.previousMousePos.y - meshCenterClient.y);
      let angle: number = this.getAngle(newClientPosition, oldClientPosition);
      angle = angle * (180 / Math.PI);
      let selectedAxes: Axis[] = this.axesSelectionHandler.getSelectedAxes();
      let rotationMatrix: ƒ.Matrix4x4;
      /*
        TODO: check if we can make this work with multiple axis, but seems very hard to predict and utilize
        maybe free rotation like in blender is a better option
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
      }
      this.previousMousePos = mousePos;
      return rotationMatrix;
    }

    private getAngle(first: ƒ.Vector2, second: ƒ.Vector2): number {
      return Math.atan2(first.x, first.y) - Math.atan2(second.x, second.y);
    }

    /*
      those functions are not used anymore since angle calculation is now done in client space, could get removed later 
    */
    private getOrthogonalVector(posAtIntersection: ƒ.Vector3, cameraTranslationNorm: ƒ.Vector3): ƒ.Vector2 {
      return new ƒ.Vector2(
        + posAtIntersection.y + posAtIntersection.z * cameraTranslationNorm.y,
        + posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
        - posAtIntersection.x * Math.abs(cameraTranslationNorm.z)
        + posAtIntersection.x * cameraTranslationNorm.y);
      // swapped signs, should work too
      // - posAtIntersection.y - posAtIntersection.z * cameraTranslationNorm.y, 
      // - posAtIntersection.z * Math.abs(cameraTranslationNorm.x)
      // - posAtIntersection.x * Math.abs(cameraTranslationNorm.z) 
      // + posAtIntersection.x * cameraTranslationNorm.y);
    }

    private getIntersection(posRender: ƒ.Vector2): ƒ.Vector3 {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(posRender);
      return ray.intersectPlane(new ƒ.Vector3(0, 0, 0), this.viewport.camera.pivot.translation);
    }

  }
}