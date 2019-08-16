/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
var UI;
/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
(function (UI) {
    var ƒui = FudgeUserInterface;
    class TestUI extends ƒui.UIMutable {
        constructor(container, state, _camera) {
            super(_camera);
            this.camera = _camera;
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
    UI.TestUI = TestUI;
})(UI || (UI = {}));
//# sourceMappingURL=TestUI.js.map