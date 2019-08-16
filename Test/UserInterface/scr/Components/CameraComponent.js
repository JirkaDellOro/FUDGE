/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
var UI;
/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
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