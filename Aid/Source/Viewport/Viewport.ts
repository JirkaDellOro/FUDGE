namespace FudgeAid {
  export class Viewport {
    public static expandCameraToInteractiveOrbit(_viewport: ƒ.Viewport, _speedCameraRotation: number = 1, _speedCameraTranslation: number = 0.01): CameraOrbit {
      _viewport.setFocus(true);
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
      _viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
      _viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
      _viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

      let cntMouseX: ƒ.Control = new ƒ.Control("MouseX", _speedCameraRotation);
      let cntMouseY: ƒ.Control = new ƒ.Control("MouseY", _speedCameraRotation);

      // camera setup
      let camera: CameraOrbit;
      camera = new CameraOrbit(_viewport.camera, 3, 80, 0.1, 20);
      camera.axisRotateX.addControl(cntMouseY);
      camera.axisRotateY.addControl(cntMouseX);
      _viewport.getGraph().addChild(camera);

      return camera;

      function hndPointerMove(_event: ƒ.EventPointer): void {
        if (!_event.buttons)
          return;
        cntMouseX.setInput(_event.movementX);
        cntMouseY.setInput(_event.movementY);
        _viewport.draw();
      }

      function hndWheelMove(_event: WheelEvent): void {
        camera.distance += _event.deltaY * _speedCameraTranslation;
        _viewport.draw();
      }
    }
  }
}