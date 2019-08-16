/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>

namespace UI {
    import ƒ = FudgeCore;
    export class TestUI extends MutableUI {
        private camera: ƒ.ComponentCamera
        protected root: HTMLFormElement;
        public constructor(container: any, state: any, _camera: ƒ.ComponentCamera) {
            super(_camera);
            this.camera = _camera;
            this.root = document.createElement("form");
            let testdiv:HTMLElement = document.createElement("div");
            testdiv.innerHTML = "I was created manually";
            this.root.append(testdiv);
            UIGenerator.createFromMutable(<ƒ.Mutable>_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
}