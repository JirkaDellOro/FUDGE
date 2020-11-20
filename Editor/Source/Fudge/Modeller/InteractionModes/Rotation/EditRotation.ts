namespace Fudge {
  import ƒ = FudgeCore;
  export class EditRotation extends AbstractRotation {
    selection: Array<number> = [];

    onmove(_event: ƒ.EventPointer): void {
      if (!this.pickedCircle)
        return;

      let rotationMatrix: ƒ.Matrix4x4 = super.getRotationVector(_event);

      let mesh: ModifiableMesh = <ModifiableMesh>this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.rotateBy(rotationMatrix, this.editableNode.mtxLocal.translation, this.selection);
    }
  }
}