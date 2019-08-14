/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>

namespace UI {
    import ƒ = Fudge;
    export class TestUI extends ƒ.UserInterface.MutableUI {
        protected root: HTMLFormElement;
        private camera: ƒ.ComponentCamera;

        public constructor(container: GoldenLayout.Container, state: Object, _camera: ƒ.ComponentCamera) {
            super(_camera);
            this.camera = _camera;
            this.root = document.createElement("form");
            let testdiv: HTMLElement = document.createElement("div");
            testdiv.innerHTML = "I was created manually";
            this.root.append(testdiv);
            ƒ.UserInterface.UIGenerator.createFromMutable(<ƒ.Mutable>_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
}