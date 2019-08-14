/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
var UI;
(function (UI) {
    var ƒ = Fudge;
    class CameraUI extends ƒ.UserInterface.MutableUI {
        constructor(container, state, _camera) {
            super(_camera);
            this.root = document.createElement("form");
            ƒ.UserInterface.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            this.root.querySelector("#_r").textContent = "Red";
            container.getElement().html(this.root);
        }
    }
    UI.CameraUI = CameraUI;
})(UI || (UI = {}));
//# sourceMappingURL=CameraComponent.js.map