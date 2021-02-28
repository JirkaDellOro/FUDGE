/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  export abstract class AbstractRotation extends InteractionMode {
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.ROTATE;
    public viewport: ƒ.Viewport;
    public selection: Array<number>;
    public editableNode: ƒ.Node;

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
    }

    onmouseup(_event: ƒ.EventPointer): string {
      let state: string = null;
      if (this.axesSelectionHandler.wasPicked) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.axesSelectionHandler.releaseComponent();
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
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
      this.axesSelectionHandler.addAxisOf(_pressedKey);
    }

    onkeyup(_pressedKey: string): string {
      let state: string = null;
      if (this.axesSelectionHandler.isValidSelection()) 
        state = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState();

      this.axesSelectionHandler.removeAxisOf(_pressedKey);
      (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).updateNormals();
      return state;
    }

    update(): void {
      this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
    }

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.axesSelectionHandler.widget);
    }
    /* 
      calculate the angle between the old and the new mouseposition in clientspace in relation to the centroid
      rotate around that angle
    */
    private getRotationMatrix(_event: ƒ.EventPointer): ƒ.Matrix4x4 {
      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.clientX, _event.clientY);
      let meshCenterClient: ƒ.Vector2 = this.viewport.pointWorldToClient(this.axesSelectionHandler.widget.mtxLocal.translation);
      let newClientPosition: ƒ.Vector2 = new ƒ.Vector2(mousePos.x - meshCenterClient.x, mousePos.y - meshCenterClient.y);
      let oldClientPosition: ƒ.Vector2 = new ƒ.Vector2(this.previousMousePos.x - meshCenterClient.x, this.previousMousePos.y - meshCenterClient.y);
      let angle: number = this.getAngle(newClientPosition, oldClientPosition);
      angle = angle * (180 / Math.PI);
      let selectedAxes: AXIS[] = this.axesSelectionHandler.getSelectedAxes();
      let rotationMatrix: ƒ.Matrix4x4;
      /*
        TODO: check if we can make this work with multiple axis, but seems very hard to predict and utilize
        maybe free rotation like in blender is a better option
        at the moment the last selected axis is used, maybe find a better solution here too
      */
      switch (selectedAxes[selectedAxes.length - 1]) {
        case AXIS.X:
          rotationMatrix = ƒ.Matrix4x4.ROTATION_X(angle);
          break;
        case AXIS.Y:
          rotationMatrix = ƒ.Matrix4x4.ROTATION_Y(angle);
          break;
        case AXIS.Z:
          rotationMatrix = ƒ.Matrix4x4.ROTATION_Z(angle);
          break;
      }
      this.previousMousePos = mousePos;
      return rotationMatrix;
    }

    private getAngle(first: ƒ.Vector2, second: ƒ.Vector2): number {
      return Math.atan2(first.x, first.y) - Math.atan2(second.x, second.y);
    }
  }
}