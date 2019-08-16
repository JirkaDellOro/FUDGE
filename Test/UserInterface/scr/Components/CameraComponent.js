/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>
var UI;
/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference types="../../../../UserInterface/Build/FudgeUI"/>
(function (UI) {
    // import ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    class CameraUI extends ƒui.UIMutable {
        constructor(container, state, _camera) {
            super(_camera);
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            this.root.querySelector("#_r").textContent = "Red";
            container.getElement().html(this.root);
        }
    }
    UI.CameraUI = CameraUI;
})(UI || (UI = {}));
//# sourceMappingURL=CameraComponent.js.map