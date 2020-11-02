namespace FudgeAid {
  export class Viewport {
    public static expandCameraToInteractiveOrbit(_viewport: ƒ.Viewport, _showFocus: boolean = true, _speedCameraRotation: number = 1, _speedCameraTranslation: number = 0.01, _speedCameraDistance: number = 0.001): CameraOrbit {
      _viewport.setFocus(true);
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
      _viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
      _viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
      _viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

      let cntMouseHorizontal: ƒ.Control = new ƒ.Control("MouseHorizontal");
      let cntMouseVertical: ƒ.Control = new ƒ.Control("MouseVertical");
      let cntMouseWheel: ƒ.Control = new ƒ.Control("MouseWheel");

      // camera setup
      let camera: CameraOrbitMovingFocus;
      camera = new CameraOrbitMovingFocus(_viewport.camera, 3, 80, 0.1, 50);
      
      // set up axis to control
      camera.axisRotateX.addControl(cntMouseVertical);
      camera.axisRotateX.setFactor(_speedCameraRotation);

      camera.axisRotateY.addControl(cntMouseHorizontal);
      camera.axisRotateY.setFactor(_speedCameraRotation);

      camera.axisTranslateX.addControl(cntMouseHorizontal);
      camera.axisTranslateX.setFactor(_speedCameraTranslation);

      camera.axisTranslateY.addControl(cntMouseVertical);
      camera.axisTranslateY.setFactor(_speedCameraTranslation);

      camera.axisTranslateZ.addControl(cntMouseWheel);
      camera.axisTranslateZ.setFactor(_speedCameraDistance);

      _viewport.getGraph().addChild(camera);

      let focus: ƒ.Node;
      if (_showFocus) {
        focus = new NodeCoordinateSystem("Focus");
        focus.addComponent(new ƒ.ComponentTransform());
        _viewport.getGraph().addChild(focus);
      }

      return camera;

      function hndPointerMove(_event: ƒ.EventPointer): void {
        if (!_event.buttons)
          return;

        camera.axisTranslateX.active = _event.shiftKey;
        camera.axisTranslateY.active = _event.shiftKey;
        camera.axisTranslateZ.active = _event.shiftKey;

        camera.axisRotateX.active = !_event.shiftKey;
        camera.axisRotateY.active = !_event.shiftKey;

        cntMouseHorizontal.setInput(_event.movementX);
        cntMouseVertical.setInput(-_event.movementY);

        focus.mtxLocal.translation = camera.mtxLocal.translation;
        _viewport.draw();
      }

      function hndWheelMove(_event: WheelEvent): void {
        if (_event.shiftKey) {
          cntMouseWheel.setInput(_event.deltaY);
        }
        else
          camera.distance += _event.deltaY * _speedCameraDistance;

        focus.mtxLocal.translation = camera.mtxLocal.translation;
        _viewport.draw();
      }
    }
  }
}