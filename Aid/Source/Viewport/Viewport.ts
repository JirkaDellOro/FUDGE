namespace FudgeAid {
  export class Viewport {
    public static createInteractive(_node: ƒ.Node, _canvas: HTMLCanvasElement): void {
      let canvas: HTMLCanvasElement = _canvas;

      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      cmpCamera.pivot.translate(new ƒ.Vector3(2, 1, 3));
      cmpCamera.pivot.lookAt(FudgeCore.Vector3.ZERO());

      let viewport: ƒ.Viewport = new FudgeCore.Viewport();
      viewport.initialize("View", _node, cmpCamera, canvas);
      viewport.draw();
      ƒ.AudioManager.default.listenTo(_node);
    }
  }
}