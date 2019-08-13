/// <reference path="../../../Core/build/Fudge.d.ts"/>
namespace Fudge {
    export namespace UserInterface {
        import ƒ = Fudge;
        export abstract class MutableUI {
            protected timeUpdate: number = 190;
            protected root: HTMLFormElement;
            protected mutable: ƒ.Mutable;
            protected mutator: ƒ.Mutator;

            constructor(_mutable: ƒ.Mutable) {
                this.root = document.createElement("form");
                this.mutable = _mutable;
                this.mutator = _mutable.getMutator();
                window.setInterval(this.updateMutator, this.timeUpdate);
                this.root.addEventListener("input", this.updateUI);
            }

            protected updateUI = (_e: Event) => {
                let formData: FormData = new FormData(this.root);
                let mutatorTypes: ƒ.MutatorAttributeTypes = this.mutable.getMutatorAttributeTypes(this.mutator);
                for (let key in this.mutator) {
                    let value: string = this.mutator[key].toString();
                    let type: string = mutatorTypes[key].toString();
                    switch (type) {
                        case "Boolean":
                            if (!formData.get(key))
                                this.mutator[key] = false;
                            else
                                this.mutator[key] = true;
                            break;
                        default:
                            if (formData.get(key) != value)
                                this.mutator[key] = formData.get(key);
                            break;
                        // case "Number":
                        //     if(formData.get(key) != value)
                        //         this.mutator[key] = formData.get(key);
                        //     break;
                        // case "String":
                        //     break;
                        // case "Object":
                        //     break;
                    }
                }
                this.mutable.mutate(this.mutator);

            }

            protected updateMutator = (_e: Event) => {
                this.mutable.updateMutator(this.mutator);
                this.fillById(this.mutator, this.root);
            }

            protected fillById(_mutator: ƒ.Mutator, _root: HTMLElement) {
                

            }
        }
    }
}
