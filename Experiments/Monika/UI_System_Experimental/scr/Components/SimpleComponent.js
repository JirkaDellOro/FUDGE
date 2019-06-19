/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    var ƒ = Fudge;
    class SimpleComponent extends UI.MutableUI {
        constructor(container, state) {
            super();
            let camera;
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.recalculateAllNodeTransforms();
            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            this.mutable = cmpCamera;
            this.root = document.createElement("div");
            this.root.addEventListener("input", this.updateUI);
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UI.UIGenerator.createFromMutator(this.mutable, this.root);
            container.getElement().html(this.root);
        }
        fillById(mutator) {
            for (let key in mutator) {
                let children = this.root.children;
                for (let child of children) {
                    if (child.id == key) {
                        child.nodeValue = mutator[key].toString();
                    }
                }
            }
        }
        obtainMutator() {
            this.mutator = this.mutable.getMutator();
        }
        updateUI(e) {
            console.log("Input Event reached");
        }
        updateMutator(e) {
            //super.resetUpdateInterval();
            //console.log("30ms passed, reset Timer");
        }
    }
    UI.SimpleComponent = SimpleComponent;
})(UI || (UI = {}));
//# sourceMappingURL=SimpleComponent.js.map