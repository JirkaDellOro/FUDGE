/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>

namespace UITest {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;
    export class TransformUI extends ƒui.UIMutable {
        protected root: HTMLFormElement;
        public constructor(container: GoldenLayout.Container, state: Object, _component: ƒ.Component) {
            super(_component);
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(<ƒ.Mutable>_component, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            // this.root.querySelector("#_r").textContent = "Red";
            
            container.getElement().html(this.root);
        }
    }
}