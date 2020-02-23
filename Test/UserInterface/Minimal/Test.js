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
    var ƒUi = FudgeUserInterface;
    let uiMatrix;
    let matrix;
    window.addEventListener("load", hndLoad);
    function hndLoad(_event) {
        let uiCamera = document.createElement("div");
        uiMatrix = document.createElement("div");
        let camera = new ƒ.ComponentCamera();
        matrix = ƒ.Matrix4x4.ROTATION_X(10);
        ƒUi.UIGenerator.createFromMutable(camera, uiCamera);
        ƒUi.UIGenerator.createFromMutable(matrix, uiMatrix);
        document.body.appendChild(uiCamera);
        document.body.appendChild(uiMatrix);
        uiMatrix.addEventListener("input", handleInput);
    }
    function handleInput(_event) {
        ƒ.Debug.log(matrix.toString());
    }
})(UI_Minimal || (UI_Minimal = {}));
//# sourceMappingURL=Test.js.map