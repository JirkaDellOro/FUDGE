// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
// / <reference types="../../@types/golden-layout"/>
// / <reference types="../../../Core/Build/FudgeCore"/>
// / <reference types="../../../UserInterface/Build/FudgeUI"/>
// /<reference path="../../Scenes/Scenes.ts"/>
var UI_Minimal;
// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
// / <reference types="../../@types/golden-layout"/>
// / <reference types="../../../Core/Build/FudgeCore"/>
// / <reference types="../../../UserInterface/Build/FudgeUI"/>
// /<reference path="../../Scenes/Scenes.ts"/>
(function (UI_Minimal) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    window.addEventListener("load", hndLoad);
    function hndLoad(_event) {
        let root = document.createElement("form");
        let camera = new ƒ.ComponentCamera();
        ƒui.UIGenerator.createFromMutable(camera, root);
        // this.root.addEventListener("input", this.mutateOnInput);
        document.body.appendChild(root);
    }
})(UI_Minimal || (UI_Minimal = {}));
//# sourceMappingURL=Test.js.map