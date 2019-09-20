/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>
var TestUI;
/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>
(function (TestUI) {
    var ƒui = FudgeUserInterface;
    class TransformUI extends ƒui.UIMutable {
        constructor(container, state, _transform) {
            super(_transform);
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(_transform, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            this.root.querySelector("#_r").textContent = "Red";
            container.getElement().html(this.root);
        }
    }
    TestUI.TransformUI = TransformUI;
})(TestUI || (TestUI = {}));
//# sourceMappingURL=TransformComponent.js.map