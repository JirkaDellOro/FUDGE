/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
var UI;
(function (UI) {
    class MutableUI {
        constructor(mutable) {
            this.timeUpdate = 190;
            this.mutateOnInput = (_e) => {
                this.mutator = this.updateMutator(this.mutable, this.root);
                this.mutable.mutate(this.mutator);
            };
            this.refreshUI = (_e) => {
                this.mutable.updateMutator(this.mutator);
                this.updateUI(this.mutable, this.root);
            };
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.refreshUI, this.timeUpdate);
            this.root.addEventListener("input", this.mutateOnInput);
        }
        updateMutator(_mutable, _root) {
            let mutator = _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                console.log(this.root.querySelector("#" + key));
                if (this.root.querySelector("#" + key) != null) {
                    let type = mutatorTypes[key];
                    if (type instanceof Object) {
                        let selectElement = _root.querySelector("#" + key);
                        selectElement.value = mutator[key];
                    }
                    else {
                        switch (type) {
                            case "Boolean":
                                let checkbox = _root.querySelector("#" + key);
                                mutator[key] = checkbox.checked;
                                break;
                            case "String":
                                let textfield = _root.querySelector("#" + key);
                                mutator[key] = textfield.value;
                                break;
                            case "Number":
                                let stepper = _root.querySelector("#" + key);
                                mutator[key] = stepper.value;
                                break;
                            case "Object":
                                let fieldset = _root.querySelector("#" + key);
                                mutator[key] = this.updateMutator(_mutable[key], fieldset);
                                break;
                        }
                    }
                }
            }
            return mutator;
        }
        updateUI(_mutable, _root) {
            let mutator = _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                if (this.root.querySelector("#" + key) != null) {
                    let type = mutatorTypes[key];
                    if (type instanceof Object) {
                        let selectElement = _root.querySelector("#" + key);
                        selectElement.value = mutator[key];
                    }
                    else {
                        switch (type) {
                            case "Boolean":
                                let checkbox = _root.querySelector("#" + key);
                                checkbox.checked = mutator[key];
                                break;
                            case "String":
                                let textfield = _root.querySelector("#" + key);
                                textfield.value = mutator[key];
                                break;
                            case "Number":
                                let stepper = _root.querySelector("#" + key);
                                stepper.value = mutator[key];
                                break;
                            case "Object":
                                let fieldset = _root.querySelector("#" + key);
                                this.updateUI(_mutable[key], fieldset);
                                break;
                        }
                    }
                }
            }
        }
    }
    UI.MutableUI = MutableUI;
})(UI || (UI = {}));
//# sourceMappingURL=MutableUI.js.map