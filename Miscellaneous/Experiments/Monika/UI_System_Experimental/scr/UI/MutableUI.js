/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
var UI;
(function (UI) {
    class MutableUI {
        constructor(mutable) {
            this.timeUpdate = 190;
            this.updateUI = (_e) => {
                console.log(_e);
                this.mutable.mutate(this.mutator);
            };
            this.updateMutator = (_e) => {
                this.mutable.updateMutator(this.mutator);
                this.fillById(this.mutator, this.root);
            };
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.updateMutator, this.timeUpdate);
            this.root.addEventListener("input", this.updateUI);
        }
        fillById(_mutator, _root) {
            let mutatorTypes = this.mutable.getMutatorAttributeTypes(this.mutator);
            for (let key in this.mutator) {
                let element = this.root.querySelector("#" + key);
                console.log(key);
                console.log(element);
                // switch(mutatorTypes[key]){
                //     case "Boolean":
                //         break;
                // }
            }
        }
    }
    UI.MutableUI = MutableUI;
})(UI || (UI = {}));
//# sourceMappingURL=MutableUI.js.map