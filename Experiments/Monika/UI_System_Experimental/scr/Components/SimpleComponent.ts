/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class SimpleComponent extends MutableUI {
        protected mutable: ƒ.Mutable;
        protected mutator: ƒ.Mutator;
        protected root:HTMLElement;

        public constructor(container: any, state: any) {
            super();
            let camera: ƒ.Node;
            ƒ.RenderManager.initialize();
            ƒ.RenderManager.recalculateAllNodeTransforms();

            camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
            let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
            this.mutable = cmpCamera;
            this.root = document.createElement("div");
            this.root.addEventListener("input", this.updateUI);
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.createFromMutator(this.mutable, this.root);
            container.getElement().html(this.root);
        }

        fillById(mutator: ƒ.Mutator) {
            for (let key in mutator) {
                let children: HTMLCollection = this.root.children;
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

        updateUI(e:Event)
        {
            console.log("Input Event reached");
        }
        updateMutator(e:Event)
        {
            //super.resetUpdateInterval();
            //console.log("30ms passed, reset Timer");
        }
    }

}