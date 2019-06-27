/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;
    export abstract class MutableUI {
        protected timeUpdate: number = 1000;
        protected root: HTMLElement;
        protected mutable: ƒ.Mutable;
        protected mutator: ƒ.Mutator;

        constructor(mutable: ƒ.Mutable) {
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.updateMutator, this.timeUpdate);
            this.root.addEventListener("input", this.updateUI);
        }

        protected updateUI =(e: Event)=> {
            console.log(e);
            this.mutable.mutate(this.mutator);

        }

        protected updateMutator = (e: Event) => {
            this.mutable.updateMutator(this.mutator);
        }

        protected fillById(mutator: ƒ.Mutator) {
            for (let key in mutator) {
                let children: HTMLCollection = this.root.children;
                for (let child of children) {
                    if (child.id == key) {
                        child.nodeValue = mutator[key].toString();
                    }
                }
            }
        }

    }

}