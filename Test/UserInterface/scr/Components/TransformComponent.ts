/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>

namespace TestUI {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    export class TransformUI extends ƒui.UIMutable {
        protected root: HTMLFormElement;
        public constructor(container: GoldenLayout.Container, state: Object, _transform: ƒ.ComponentTransform) {
            super(_transform);
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(<ƒ.Mutable>_transform, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            this.root.querySelector("#_r").textContent = "Red";
            
            container.getElement().html(this.root);
        }
    }
}