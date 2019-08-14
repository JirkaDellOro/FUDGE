/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../UI/MutableUI.ts"/>
var UI;
(function (UI) {
    class CameraUI extends UI.MutableUI {
        constructor(container, state, _camera) {
            super(_camera);
            this.root = document.createElement("form");
            UI.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
    UI.CameraUI = CameraUI;
})(UI || (UI = {}));
//# sourceMappingURL=CameraComponent.js.map