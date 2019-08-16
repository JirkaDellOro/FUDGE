/// <reference types="../../../../Core/Build/FudgeCore"/>
var MoniUI;
/// <reference types="../../../../Core/Build/FudgeCore"/>
(function (MoniUI) {
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
            let children = _root.children;
            for (let child of children) {
                if (child.children.length > 0) {
                    this.fillById(_mutator, child);
                }
                for (let key in _mutator) {
                    if (child.id == key) {
                        let type = child.getAttribute("type");
                        if (type == "checkbox") {
                            let checkbox = child;
                            checkbox.checked = _mutator[key];
                        }
                        else {
                            let input = child;
                            input.value = _mutator[key];
                        }
                    }
                }
            }
        }
    }
    MoniUI.MutableUI = MutableUI;
})(MoniUI || (MoniUI = {}));
//# sourceMappingURL=MutableUI.js.map