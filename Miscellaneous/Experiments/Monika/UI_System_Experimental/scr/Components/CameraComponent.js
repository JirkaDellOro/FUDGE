/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    class CameraUI extends UI.MutableUI {
        constructor(container, state, _camera) {
            super(_camera);
            this.updateUI = (_event) => {
                let target = _event.target;
                this.mutator = this.mutable.getMutator();
                let formData = new FormData(this.root);
                // this.fillById(this.mutator);
                if (target.type == "checkbox") {
                    this.mutator[target.id] = target.checked;
                }
                else {
                    console.log(formData);
                    for (let entry of formData) {
                        if (entry[0] == target.id) {
                            this.mutator[entry[0]] = entry[1];
                        }
                    }
                }
                this.mutable.mutate(this.mutator);
            };
            this.root = document.createElement("form");
            UI.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.updateUI);
            container.getElement().html(this.root);
        }
    }
    UI.CameraUI = CameraUI;
})(UI || (UI = {}));
//# sourceMappingURL=CameraComponent.js.map