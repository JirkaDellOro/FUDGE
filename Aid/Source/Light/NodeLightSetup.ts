/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
    import ƒ = FudgeCore;
  
    /** Three Point Light setup that by default illuminates the Scene from +Z */
    export class NodeThreePointLights extends Node {
        constructor(_name: string, _rotationY: number) {
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