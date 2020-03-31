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

    ƒUi.Generator.createFromMutable(camera, uiCamera);
    ƒUi.Generator.createFromMutable(matrix, uiMatrix);
    document.body.appendChild(uiCamera);
    document.body.appendChild(uiMatrix);
    uiMatrix.addEventListener("input", handleInput);
  }

  function handleInput(_event: Event): void {
    ƒ.Debug.log(matrix.toString());
  }
}