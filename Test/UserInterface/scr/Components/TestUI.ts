/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>

namespace UITest {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    export class TestUI extends ƒui.Mutable {
        protected root: HTMLFormElement;
        private camera: ƒ.ComponentCamera;

        public constructor(container: GoldenLayout.Container, state: Object, _camera: ƒ.ComponentCamera) {
            super(_camera);
            this.camera = _camera;
            this.root = document.createElement("form");
            ƒui.Generator.createFromMutable(<ƒ.Mutable>this.camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
}