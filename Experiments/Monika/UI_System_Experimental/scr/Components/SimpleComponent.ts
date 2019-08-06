/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class SimpleComponent extends MutableUI {

        public constructor(container: any, state: any) {
            let camera: ƒ.Node;
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.update();
            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
            super(cmpCamera);
            console.log(this.mutable);
            let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.createFromMutator(this.mutable, <HTMLFormElement>this.root);
            container.getElement().html(this.root);
        }
    }

}