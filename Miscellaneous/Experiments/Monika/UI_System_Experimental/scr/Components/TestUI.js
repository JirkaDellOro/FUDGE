/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    class TestUI extends UI.MutableUI {
        constructor(container, state, _camera) {
            super(_camera);
            this.mutateOnInput = (_event) => {
                let target = _event.target;
                this.mutator = this.mutable.getMutator();
                let formData = new FormData(this.root);
                // this.fillById(this.mutator);
                if (target.type == "checkbox") {
                    this.mutator[target.id] = target.checked;
                }
                else {
                    for (let entry of formData) {
                        if (entry[0] == target.id) {
                            this.mutator[entry[0]] = entry[1];
                        }
                    }
                }
                this.mutable.mutate(this.mutator);
            };
            this.camera = _camera;
            this.root = document.createElement("form");
            let testdiv = document.createElement("div");
            testdiv.innerHTML = "I was created manually";
            this.root.append(testdiv);
            UI.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
    UI.TestUI = TestUI;
})(UI || (UI = {}));
//# sourceMappingURL=TestUI.js.map