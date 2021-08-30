/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  /**
   * Adds a light setup to the node given, consisting of an ambient light, a directional key light and a directional back light.
   * Exept of the node to become the container, all parameters are optional and provided default values for general purpose. 
   */
  export function addStandardLightComponents(
    _node: ƒ.Node,
    _clrAmbient: ƒ.Color = new ƒ.Color(0.2, 0.2, 0.2), _clrKey: ƒ.Color = new ƒ.Color(0.9, 0.9, 0.9), _clrBack: ƒ.Color = new ƒ.Color(0.6, 0.6, 0.6),
    _posKey: ƒ.Vector3 = new ƒ.Vector3(4, 12, 8), _posBack: ƒ.Vector3 = new ƒ.Vector3(-1, -0.5, -3)
  ): void {
    let key: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrKey));
    key.mtxPivot.translate(_posKey);
    key.mtxPivot.lookAt(ƒ.Vector3.ZERO());

    let back: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrBack));
    back.mtxPivot.translate(_posBack);
    back.mtxPivot.lookAt(ƒ.Vector3.ZERO());

    let ambient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(_clrAmbient));

    _node.addComponent(key);
    _node.addComponent(back);
    _node.addComponent(ambient);
  }
}
