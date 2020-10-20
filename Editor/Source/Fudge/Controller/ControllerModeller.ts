namespace Fudge {
  import ƒ = FudgeCore;

  export class ControllerModeller {
    viewport: ƒ.Viewport;
    currentRotation: ƒ.Vector3;
    target: ƒ.Vector3 = ƒ.Vector3.ZERO();
    selectedNodes: ƒ.Node[];

    constructor (viewport: ƒ.Viewport) {
      this.viewport = viewport;

      this.viewport.adjustingFrames = true;
      this.currentRotation = viewport.camera.pivot.rotation;

      this.viewport.addEventListener(ƒ.EVENT_POINTER.DOWN, this.onclick);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);

      this.viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, this.handleMove);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);

      this.viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, this.zoom);
      this.viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);

      this.viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, this.handleKeyboard);
      this.viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
      viewport.setFocus(true);
    }

    private onclick = (_event: ƒ.EventPointer) => {
      switch (_event.button) {
        case 0: //this.pickNode(_event.canvasX, _event.canvasY); 
        break;
        case 1: this.currentRotation = this.viewport.camera.pivot.rotation;
      }
    }

    private handleMove = (_event: ƒ.EventPointer) => {
      if ((_event.buttons & 4) === 4) {
        _event.preventDefault();
        if (_event.shiftKey) {
          this.moveCamera(_event);
        } else {
          this.rotateCamera(_event);
        }
      }
    }

    private handleKeyboard = (_event: ƒ.EventKeyboard) => {
      if (_event.key == ƒ.KEYBOARD_CODE.DELETE) {
        for (let node of this.selectedNodes) {
          this.viewport.getGraph().removeChild(node);
        }
      } 
    }

    private zoom = (_event: ƒ.EventWheel) => {
      _event.preventDefault();
      let cameraPivot: ƒ.Matrix4x4 = this.viewport.camera.pivot;
      let delta: number = _event.deltaY * 0.01;
      try {
        let normTrans: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(cameraPivot.translation);
        cameraPivot.translation = new ƒ.Vector3(
          cameraPivot.translation.x + (normTrans.x - this.target.x) * delta, 
          cameraPivot.translation.y + (normTrans.y - this.target.y) * delta, 
          cameraPivot.translation.z + (normTrans.z - this.target.z) * delta);
      } catch (_error) {
        ƒ.Debug.log(_error);
      }
    }


    private rotateCamera(_event: ƒ.EventPointer): void {
      let currentTranslation: ƒ.Vector3 = this.viewport.camera.pivot.translation;

      let magicalScaleDivisor: number = 4;
      let angleYaxis: number = _event.movementX / magicalScaleDivisor;
      let mtxYrot: ƒ.Matrix4x4 = ƒ.Matrix4x4.ROTATION_Y(angleYaxis);

      currentTranslation = this.multiplyMatrixes(mtxYrot, currentTranslation);

      let cameraRotation: ƒ.Vector3 = this.viewport.camera.pivot.rotation;
      let degreeToRad: number = Math.PI / 180;
      let angleZAxis: number = Math.sin(degreeToRad * cameraRotation.y) * (_event.movementY / magicalScaleDivisor);
      let angleXAxis: number = -(Math.cos(degreeToRad * cameraRotation.y) * (_event.movementY / magicalScaleDivisor));

      angleZAxis = Math.min(Math.max(-89, angleZAxis), 89);
      angleXAxis = Math.min(Math.max(-89, angleXAxis), 89);

      let mtxXrot: ƒ.Matrix4x4 = ƒ.Matrix4x4.ROTATION_X(angleXAxis);
      currentTranslation = this.multiplyMatrixes(mtxXrot, currentTranslation);

      let mtxZrot: ƒ.Matrix4x4 = ƒ.Matrix4x4.ROTATION_Z(angleZAxis);
      this.viewport.camera.pivot.translation = this.multiplyMatrixes(mtxZrot, currentTranslation);

      let rotation: ƒ.Vector3 = ƒ.Matrix4x4.MULTIPLICATION(ƒ.Matrix4x4.MULTIPLICATION(mtxYrot, mtxXrot), mtxZrot).rotation;
      this.viewport.camera.pivot.rotation = rotation;

      this.viewport.camera.pivot.lookAt(this.target);
    }

    private moveCamera(_event: ƒ.EventPointer): void {
      let currentTranslation: ƒ.Vector3 = this.viewport.camera.pivot.translation;
      let distanceToTarget: number = ƒ.Vector3.DIFFERENCE(currentTranslation, this.target).magnitude;
      let cameraRotation: ƒ.Vector3 = this.viewport.camera.pivot.rotation;
      let degreeToRad: number = Math.PI / 180;
      let cosX: number = Math.cos(cameraRotation.x * degreeToRad);
      let cosY: number = Math.cos(cameraRotation.y * degreeToRad);
      let sinX: number = Math.sin(cameraRotation.x * degreeToRad);
      let sinY: number = Math.sin(cameraRotation.y * degreeToRad);
      let movementXscaled: number = _event.movementX / 100;
      let movementYscaled: number = _event.movementY / 100;  
         
      let translationChange: ƒ.Vector3 = new ƒ.Vector3(
        -cosY * movementXscaled - sinX * sinY * movementYscaled,
        -cosX * movementYscaled,
        sinY * movementXscaled - sinX * cosY * movementYscaled);

      this.viewport.camera.pivot.translation = new ƒ.Vector3(
        currentTranslation.x + translationChange.x, 
        currentTranslation.y + translationChange.y, 
        currentTranslation.z + translationChange.z);

      let rayToCenter: ƒ.Ray =  this.viewport.getRayFromClient(new ƒ.Vector2(this.viewport.getCanvasRectangle().width / 2, this.viewport.getCanvasRectangle().height / 2));
      rayToCenter.direction.scale(distanceToTarget);
      let rayEnd: ƒ.Vector3 = ƒ.Vector3.SUM(rayToCenter.origin, rayToCenter.direction);
      this.target = rayEnd;
    }

    // private pickNode(_canvasX: number, _canvasY: number): void {
    //   this.selectedNodes = [];
    //   this.viewport.createPickBuffers();
    //   let mousePos: ƒ.Vector2 = new ƒ.Vector2(_canvasX, _canvasY);
    //   let posRender: ƒ.Vector2 = this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getClientRectangle().height - mousePos.y));
    //   let hits: ƒ.RayHit[] = this.viewport.pickNodeAt(posRender);
    //   for (let hit of hits) {
    //     if (hit.zBuffer != 0) 
    //       this.selectedNodes.push(hit.node);
    //   } 
    //   let ray: ƒ.Ray = this.viewport.getRayFromClient(mousePos);
    //   let vertices: Float32Array = this.selectedNodes[0].getComponent(ƒ.ComponentMesh).mesh.vertices;
    //   for (let i: number = 0; i < vertices.length / 2; i += 3) {
    //     let vertex: ƒ.Vector3 = new ƒ.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
    //     let objTranslation: ƒ.Vector3 = this.selectedNodes[0].mtxLocal.translation;
    //     let vertexTranslation: ƒ.Vector3 = ƒ.Vector3.SUM(objTranslation, vertex);
    //     console.log(ray.getDistance(vertexTranslation).magnitude);
    //   }
    //   console.log("---------------------------");
    // }


    private multiplyMatrixes(mtx: ƒ.Matrix4x4, vector: ƒ.Vector3): ƒ.Vector3 {
      let x: number = ƒ.Vector3.DOT(mtx.getX(), vector);
      let y: number = ƒ.Vector3.DOT(mtx.getY(), vector);
      let z: number = ƒ.Vector3.DOT(mtx.getZ(), vector);
      return new ƒ.Vector3(x, y, z);
    }
  }
}