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
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.UP, true);
      _viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
      _viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
      _viewport.addEventListener(ƒ.EVENT_POINTER.DOWN, hndPointerDown);
      _viewport.addEventListener(ƒ.EVENT_POINTER.UP, hndPointerUp);
      _viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
      _viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

      let factorPan: number = 1 / 500;
      let factorFly: number = 1 / 20;
      let factorZoom: number = 1 / 3;

      let flySpeed: number = 0.3;
      let flyAccelerated: number = 10;
      let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 20, 0, hndTimer);
      let cntFly: ƒ.Control = new ƒ.Control("Fly", flySpeed);
      cntFly.setDelay(500);
      let flying: boolean = false;
      console.log(timer);

      let cntMouseHorizontal: ƒ.Control = new ƒ.Control("MouseHorizontal", -1);
      let cntMouseVertical: ƒ.Control = new ƒ.Control("MouseVertical", -1);

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

        let posCamera: ƒ.Vector3 = camera.nodeCamera.mtxWorld.translation.clone;

        // orbit
        if (
          (_event.buttons == 4 && !(_event.ctrlKey || _event.altKey || _event.shiftKey)) ||
          (_event.buttons == 1 && _event.altKey)) {
          cntMouseHorizontal.setInput(_event.movementX);
          cntMouseVertical.setInput(_event.movementY);
        }

        // fly
        if (_event.buttons == 2 && !_event.altKey) {
          cntMouseHorizontal.setInput(_event.movementX * factorFly);
          cntMouseVertical.setInput(_event.movementY * factorFly);
          ƒ.Render.prepare(camera);
          let offset: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(posCamera, camera.nodeCamera.mtxWorld.translation);
          camera.mtxLocal.translate(offset, false);
        }

        // zoom
        if ((_event.buttons == 4 && _event.ctrlKey) || (_event.buttons == 2 && _event.altKey))
          zoom(_event.movementX * factorZoom);

        // pan 

        if (_event.buttons == 4 && (_event.altKey || _event.shiftKey)) {
          camera.translateX(-_event.movementX * camera.distance * factorPan);
          camera.translateY(_event.movementY * camera.distance * factorPan);
        }

        redraw();
      }

      function hndTimer(_event: ƒ.EventTimer): void {
        if (!flying)
          return;
        cntFly.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? flyAccelerated : flySpeed);
        cntFly.setInput(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.Q, ƒ.KEYBOARD_CODE.E]) ? 1 : 0);

        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W]))
          camera.translateZ(-cntFly.getOutput());
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S]))
          camera.translateZ(cntFly.getOutput());
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A]))
          camera.translateX(-cntFly.getOutput());
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D]))
          camera.translateX(cntFly.getOutput());
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.Q]))
          camera.translateY(-cntFly.getOutput());
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.E]))
          camera.translateY(cntFly.getOutput());
        else
          return;
        redraw();
      }

      function hndPointerDown(_event: ƒ.EventPointer): void {
        flying = (_event.buttons == 2 && !_event.altKey);
        if (_event.button != 0 || _event.ctrlKey || _event.altKey || _event.shiftKey)
          return;

        let pos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
        let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(_viewport, pos);
        if (picks.length == 0)
          return;
        picks.sort((_a: ƒ.Pick, _b: ƒ.Pick) => _a.zBuffer < _b.zBuffer ? -1 : 1);

        // let posCamera: ƒ.Vector3 = camera.nodeCamera.mtxWorld.translation;
        // camera.mtxLocal.translation = picks[0].posWorld;
        // // ƒ.Render.prepare(camera);
        // camera.positionCamera(posCamera);
        camera.mtxLocal.translation = picks[0].posWorld;
        redraw();

        _viewport.getCanvas().dispatchEvent(new CustomEvent("pick", { detail: picks[0], bubbles: true }));
      }

      function hndPointerUp(_event: ƒ.EventPointer): void {
        flying = false;
      }

      function hndWheelMove(_event: WheelEvent): void {
        zoom(_event.deltaY);
        redraw();
      }
      function zoom(_delta: number): void {
        camera.distance *= 1 + _delta * _speedCameraDistance;
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