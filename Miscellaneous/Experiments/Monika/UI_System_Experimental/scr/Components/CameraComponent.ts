/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class CameraUI extends MutableUI {
        protected root: HTMLFormElement;
        public constructor(container: any, state: any, _camera: ƒ.ComponentCamera) {
            super(_camera);
            this.root = document.createElement("form");
            UIGenerator.createFromMutable(<ƒ.Mutable>_camera, this.root);
            this.root.addEventListener("input", this.updateUI);
            container.getElement().html(this.root);
        }
        protected updateUI = (_event: Event) => {
            let target: HTMLInputElement = <HTMLInputElement>_event.target;
            this.mutator = this.mutable.getMutator();
            let formData: FormData = new FormData(this.root);
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
        }
    }
}