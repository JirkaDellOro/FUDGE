/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = FudgeCore;
    export class CameraUI extends MutableUI {
        protected root: HTMLFormElement;
        public constructor(container: any, state: any, _camera: ƒ.ComponentCamera) {
            super(_camera);
            this.root = document.createElement("form");
            UIGenerator.createFromMutable(<ƒ.Mutable>_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
}