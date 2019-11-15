/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
var UITest;
/// <reference types="../../../../Core/Build/FudgeCore"/>
/// <reference path="../../../../UserInterface/Build/FudgeUI.d.ts"/>
(function (UITest) {
    var ƒui = FudgeUserInterface;
    class TestUI extends ƒui.UIMutable {
        constructor(container, state, _camera) {
            super(_camera);
            this.camera = _camera;
            this.root = document.createElement("form");
            ƒui.UIGenerator.createFromMutable(this.camera, this.root);
            this.root.addEventListener("input", this.mutateOnInput);
            container.getElement().html(this.root);
        }
    }
    UITest.TestUI = TestUI;
})(UITest || (UITest = {}));
//# sourceMappingURL=TestUI.js.map