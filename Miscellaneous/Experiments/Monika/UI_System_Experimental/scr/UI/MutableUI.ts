/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;
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

        protected fillById(_mutator: ƒ.Mutator, _root: HTMLElement) {
            let mutatorTypes: ƒ.MutatorAttributeTypes = this.mutable.getMutatorAttributeTypes(this.mutator);
            for(let key in this.mutator)
            {  
                let element:HTMLInputElement = this.root.querySelector("#"+key);
                console.log(key);
                console.log(element);
                // switch(mutatorTypes[key]){
                //     case "Boolean":

                //         break;
                // }
                
            }
        }
    }
}
