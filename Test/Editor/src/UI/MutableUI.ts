/// <reference types="../../../../Core/Build/FudgeCore"/>
namespace MoniUI {
    import ƒ = FudgeCore;
    export abstract class MutableUI {
        protected timeUpdate: number = 190;
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

        protected updateUI = (_e: Event) => {
            console.log(_e);
            this.mutable.mutate(this.mutator);

        }

        protected updateMutator = (_e: Event) => {
            this.mutable.updateMutator(this.mutator);
            this.fillById(this.mutator, this.root);
        }

        protected fillById(_mutator: ƒ.Mutator, _root: HTMLElement): void {
            let children: HTMLCollection = _root.children;
            for (let child of children) {
                if (child.children.length > 0) {
                    this.fillById(_mutator, <HTMLInputElement>child);
                }
                for (let key in _mutator) {
                    if (child.id == key) {
                        let type: string = child.getAttribute("type");
                        if (type == "checkbox") {
                            let checkbox: HTMLInputElement = <HTMLInputElement>child;
                            checkbox.checked = <boolean>_mutator[key];
                        }
                        else {
                            let input: HTMLInputElement = <HTMLInputElement>child;
                            input.value = <string>_mutator[key];
                        }
                    }
                }
            }
        }
    }
}
