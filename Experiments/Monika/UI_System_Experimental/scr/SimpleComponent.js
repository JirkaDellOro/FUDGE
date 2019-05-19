/// <reference path="../../../../Core/build/Fudge.d.ts"/>
var UI;
(function (UI) {
    var ƒ = Fudge;
    class SimpleComponent {
        constructor(container, state) {
            let camera;
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.recalculateAllNodeTransforms();
            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            let element = document.createElement("div");
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UI.UIGenerator.createFromMutator(cmpCamera, element);
            container.getElement().html(element);
        }
    }
    UI.SimpleComponent = SimpleComponent;
})(UI || (UI = {}));
//# sourceMappingURL=SimpleComponent.js.map