namespace FudgeAid {
  export class Viewport {
    public static expandCameraToInteractiveOrbit(_viewport: ƒ.Viewport, _showFocus: boolean = true, _speedCameraRotation: number = 1, _speedCameraTranslation: number = 0.01, _speedCameraDistance: number = 0.001): CameraOrbit {
      _viewport.setFocus(true);
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
      _viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
      _viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
      _viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

      let cntMouseRotationX: ƒ.Control = new ƒ.Control("MouseX", _speedCameraRotation);
      let cntMouseRotationY: ƒ.Control = new ƒ.Control("MouseY", _speedCameraRotation);
      let cntMouseTranslationX: ƒ.Control = new ƒ.Control("MouseX", _speedCameraTranslation);
      let cntMouseTranslationY: ƒ.Control = new ƒ.Control("MouseY", _speedCameraTranslation);
      let cntMouseTranslationZ: ƒ.Control = new ƒ.Control("MouseZ", _speedCameraDistance);
      // cntMouseTranslationZ.setDelay(50);
      // cntMouseTranslationZ.setRateDispatchOutput(50);

      // camera setup
      let camera: CameraOrbitMovingFocus;
      camera = new CameraOrbitMovingFocus(_viewport.camera, 3, 80, 0.1, 50);
      camera.axisRotateX.addControl(cntMouseRotationY);
      camera.axisRotateY.addControl(cntMouseRotationX);
      camera.axisTranslateX.addControl(cntMouseTranslationX);
      camera.axisTranslateY.addControl(cntMouseTranslationY);
      camera.axisTranslateZ.addControl(cntMouseTranslationZ);
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

        if (_event.shiftKey) {
          cntMouseTranslationX.pulse(_event.movementX);
          cntMouseTranslationY.pulse(-_event.movementY);
        }
        else {
          cntMouseRotationX.pulse(_event.movementX);
          cntMouseRotationY.pulse(_event.movementY);
        }

        focus.mtxLocal.translation = camera.mtxLocal.translation;
        _viewport.draw();
      }

      function hndWheelMove(_event: WheelEvent): void {
        if (_event.shiftKey) {
          cntMouseTranslationZ.pulse(_event.deltaY);
        }
        else
          camera.distance += _event.deltaY * _speedCameraDistance;

        focus.mtxLocal.translation = camera.mtxLocal.translation;
        _viewport.draw();
      }
    }
  }
}