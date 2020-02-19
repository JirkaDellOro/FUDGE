// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
// / <reference types="../../@types/golden-layout"/>
// / <reference types="../../../Core/Build/FudgeCore"/>
// / <reference types="../../../UserInterface/Build/FudgeUI"/>
// /<reference path="../../Scenes/Scenes.ts"/>



namespace UI_Minimal {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  let uiMatrix: HTMLDivElement;
  let matrix: ƒ.Matrix4x4;

  window.addEventListener("load", hndLoad);

  function hndLoad(_event: Event): void {
    let uiCamera: HTMLDivElement = document.createElement("div");
    uiMatrix = document.createElement("div");
    let camera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    matrix = ƒ.Matrix4x4.ROTATION_X(10);

    ƒUi.UIGenerator.createFromMutable(camera, uiCamera);
    ƒUi.UIGenerator.createFromMutable(matrix, uiMatrix);
    document.body.appendChild(uiCamera);
    document.body.appendChild(uiMatrix);
    uiMatrix.addEventListener("input", handleInput);
  }

  function handleInput(_event: Event): void {
    ƒ.Debug.log(matrix.toString());
  }
}