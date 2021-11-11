namespace FudgeCore {
  export class Bone extends Node {

    constructor(_name: string, _mtxInit?: Matrix4x4) {
      super(_name);
      if (_mtxInit) this.addComponent(new ComponentTransform(_mtxInit));
    }

  }
}