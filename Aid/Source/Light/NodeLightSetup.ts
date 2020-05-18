/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export function addStandardLightComponents(
    _node: ƒ.Node,
    _clrAmbient: ƒ.Color = new ƒ.Color(0.2, 0.2, 0.2), _clrKey: ƒ.Color = new ƒ.Color(0.9, 0.9, 0.9), _clrBack: ƒ.Color = new ƒ.Color(0.6, 0.6, 0.6),
    _posKey: ƒ.Vector3 = new ƒ.Vector3(4, 12, 8), _posBack: ƒ.Vector3 = new ƒ.Vector3(-1, -0.5, -3)
  ): void {
    let key: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrKey));
    key.pivot.translate(_posKey);
    key.pivot.lookAt(ƒ.Vector3.ZERO());

    let back: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrBack));
    back.pivot.translate(_posBack);
    back.pivot.lookAt(ƒ.Vector3.ZERO());

    let ambient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(_clrAmbient));

    _node.addComponent(key);
    _node.addComponent(back);
    _node.addComponent(ambient);
  }

  /** Three Point Light setup that by default illuminates the Scene from +Z */
  export class NodeThreePointLights extends Node {
    constructor(_name: string, _rotationY: number = 0) {
      super(_name);
      let rimlight: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1.3, 1.3, 1.7, 1.0)));
      rimlight.pivot.rotate(new ƒ.Vector3(60, 0, -60));

      let keylight: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0.94, 0.87)));
      keylight.pivot.rotate(new ƒ.Vector3(150, -20, 30));

      let ambient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.1, 0.1, 0.1)));

      this.addComponent(rimlight);
      this.addComponent(ambient);
      this.addComponent(keylight);

      this.addComponent(new ƒ.ComponentTransform);
      this.mtxLocal.rotateY(_rotationY);

      return this;
    }
  }
}