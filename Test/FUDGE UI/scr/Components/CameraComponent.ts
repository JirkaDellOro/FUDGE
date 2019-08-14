/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class CameraUI extends ƒ.UserInterface.MutableUI {
        protected root: HTMLFormElement;
        public constructor(container: any, state: any, _camera: ƒ.ComponentCamera) {
            super(_camera);
            this.root = document.createElement("form");
            ƒ.UserInterface.UIGenerator.createFromMutable(<ƒ.Mutable>_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            this.root.querySelector("#_r").textContent = "Red";
        
            container.getElement().html(this.root);
        }
    }
}