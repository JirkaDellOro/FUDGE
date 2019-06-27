/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
var UI;
(function (UI) {
    class MutableUI {
        constructor(mutable) {
            this.timeUpdate = 1000;
            this.updateUI = (e) => {
                console.log(e);
                this.mutable.mutate(this.mutator);
            };
            this.updateMutator = (e) => {
                this.mutable.updateMutator(this.mutator);
            };
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.updateMutator, this.timeUpdate);
            this.root.addEventListener("input", this.updateUI);
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
    }
    UI.MutableUI = MutableUI;
})(UI || (UI = {}));
//# sourceMappingURL=MutableUI.js.map