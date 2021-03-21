namespace FudgeAid {
  export class Viewport {
    public static create(_branch: ƒ.Node): ƒ.Viewport {
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      cmpCamera.mtxPivot.translate(ƒ.Vector3.Z(4));
      cmpCamera.mtxPivot.rotateY(180);
      
      let canvas: HTMLCanvasElement = Canvas.create();
      document.body.appendChild(canvas);

      let viewport: ƒ.Viewport = new ƒ.Viewport();
      viewport.initialize("ƒAid-Viewport", _branch, cmpCamera, canvas);
      return viewport;
    }

    public static expandCameraToInteractiveOrbit(_viewport: ƒ.Viewport, _showFocus: boolean = true, _speedCameraRotation: number = 1, _speedCameraTranslation: number = 0.01, _speedCameraDistance: number = 0.001): CameraOrbit {
      _viewport.setFocus(true);
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
      _viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
      _viewport.addEventListener(ƒ.EVENT_POINTER.DOWN, hndPointerDown);
      _viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
      _viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

      let cntMouseHorizontal: ƒ.Control = new ƒ.Control("MouseHorizontal");
      let cntMouseVertical: ƒ.Control = new ƒ.Control("MouseVertical");

      // camera setup
      let camera: CameraOrbitMovingFocus;
      camera = new CameraOrbitMovingFocus(_viewport.camera, 5, 85, 0.01, 1000);
      _viewport.camera.projectCentral(_viewport.camera.getAspect(), _viewport.camera.getFieldOfView(), _viewport.camera.getDirection(), 0.01, 1000);

      // yset up axis to control
      camera.axisRotateX.addControl(cntMouseVertical);
      camera.axisRotateX.setFactor(_speedCameraRotation);

      camera.axisRotateY.addControl(cntMouseHorizontal);
      camera.axisRotateY.setFactor(_speedCameraRotation);
      // _viewport.getBranch().addChild(camera);

      let focus: ƒ.Node;
      if (_showFocus) {
        focus = new NodeCoordinateSystem("Focus");
        focus.addComponent(new ƒ.ComponentTransform());
        _viewport.getBranch().addChild(focus);
      }

      redraw();
      return camera;



      function hndPointerMove(_event: ƒ.EventPointer): void {
        if (!_event.buttons)
          return;

        let posCamera: ƒ.Vector3 = camera.nodeCamera.mtxWorld.translation.copy;

        cntMouseHorizontal.setInput(_event.movementX);
        cntMouseVertical.setInput(_event.movementY);
        ƒ.Render.prepare(camera);

        if (_event.altKey || _event.buttons == 4) {
          let offset: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(posCamera, camera.nodeCamera.mtxWorld.translation);
          camera.mtxLocal.translate(offset, false);
        }

        redraw();
      }

      function hndPointerDown(_event: ƒ.EventPointer): void {
        let pos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
        let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(_viewport, pos);
        if (picks.length == 0)
          return;
        picks.sort((_a: ƒ.Pick, _b: ƒ.Pick) => _a.zBuffer < _b.zBuffer ? -1 : 1);

        let posCamera: ƒ.Vector3 = camera.nodeCamera.mtxWorld.translation;
        camera.mtxLocal.translation = picks[0].posWorld;
        ƒ.Render.prepare(camera);
        camera.positionCamera(posCamera);
        redraw();
      }

      function hndWheelMove(_event: WheelEvent): void {
        camera.distance *= 1 + (_event.deltaY * _speedCameraDistance);
        redraw();
      }

      function redraw(): void {
        if (focus)
          focus.mtxLocal.translation = camera.mtxLocal.translation;
        ƒ.Render.prepare(camera);
        _viewport.draw();
      }
    }
  }
}