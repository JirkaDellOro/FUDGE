/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
var UI;
/// <reference path="../../../../Core/Build/Fudge.d.ts"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
(function (UI) {
    var ƒui = FudgeUserInterface;
    class TestUI extends ƒui.UIMutable {
        constructor(container, state, _camera) {
            super(_camera);
            this.camera = _camera;
            this.root = document.createElement("form");
            let testdiv = document.createElement("div");
            let toggleButton = new ƒui.ToggleButton();
            testdiv.append(toggleButton);
            testdiv.innerHTML = "I was created manually";
            this.root.append(testdiv);
            ƒui.UIGenerator.createFromMutable(_camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
    UI.TestUI = TestUI;
})(UI || (UI = {}));
//# sourceMappingURL=TestUI.js.map