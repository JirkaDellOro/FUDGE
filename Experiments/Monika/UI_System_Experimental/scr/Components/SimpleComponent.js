/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    var ƒ = Fudge;
    class SimpleComponent extends UI.MutableUI {
        constructor(container, state) {
            let camera;
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.update();
            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            super(cmpCamera);
            console.log(this.mutable);
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UI.UIGenerator.createFromMutator(this.mutable, this.root);
            container.getElement().html(this.root);
        }
    }
    UI.SimpleComponent = SimpleComponent;
})(UI || (UI = {}));
//# sourceMappingURL=SimpleComponent.js.map