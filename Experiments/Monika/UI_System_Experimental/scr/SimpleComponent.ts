/// <reference path="../../../../Core/build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;
    export class SimpleComponent {
        public constructor(container: any, state: any) {
            let camera: ƒ.Node;
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.recalculateAllNodeTransforms();

            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
            let element: HTMLSpanElement = document.createElement("div");
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.createFromMutator(cmpCamera, element);
            container.getElement().html(element);
        }
    }

}