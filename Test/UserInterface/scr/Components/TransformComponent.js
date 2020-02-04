/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>
var UITest;
/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>
(function (UITest) {
    var ƒui = FudgeUserInterface;
    class TransformUI extends ƒui.UIMutable {
        constructor(container, state, _component) {
            super(_component);
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(_component, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            // this.root.querySelector("#_r").textContent = "Red";
            container.getElement().html(this.root);
        }
    }
    UITest.TransformUI = TransformUI;
})(UITest || (UITest = {}));
//# sourceMappingURL=TransformComponent.js.map