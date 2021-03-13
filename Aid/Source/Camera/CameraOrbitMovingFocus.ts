namespace FudgeAid {
  import ƒ = FudgeCore;

  export class CameraOrbitMovingFocus extends CameraOrbit {
    public readonly axisTranslateX: ƒ.Axis = new ƒ.Axis("TranslateX", 1, ƒ.CONTROL_TYPE.PROPORTIONAL, true);
    public readonly axisTranslateY: ƒ.Axis = new ƒ.Axis("TranslateY", 1, ƒ.CONTROL_TYPE.PROPORTIONAL, true);
    public readonly axisTranslateZ: ƒ.Axis = new ƒ.Axis("TranslateZ", 1, ƒ.CONTROL_TYPE.PROPORTIONAL, true);

    public constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart: number = 5, _maxRotX: number = 85, _minDistance: number = 0, _maxDistance: number = Infinity) {
      super(_cmpCamera, _distanceStart, _maxRotX, _minDistance, _maxDistance);
      this.name = "CameraOrbitMovingFocus";

      this.axisTranslateX.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, this.hndAxisOutput);
      this.axisTranslateY.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, this.hndAxisOutput);
      this.axisTranslateZ.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, this.hndAxisOutput);
    }

    public translateX(_delta: number): void {
      this.mtxLocal.translateX(_delta);
    }
    
    public translateY(_delta: number): void {
      let translation: ƒ.Vector3 = this.rotatorX.mtxWorld.getY();
      translation.normalize(_delta);
      this.mtxLocal.translate(translation, false);
    }

    public translateZ(_delta: number): void {
      // this.mtxLocal.translateZ(_delta);
      let translation: ƒ.Vector3 = this.rotatorX.mtxWorld.getZ();
      translation.normalize(_delta);
      this.mtxLocal.translate(translation, false);
    }

    public hndAxisOutput: EventListener = (_event: Event): void => {
      let output: number = (<CustomEvent>_event).detail.output;
      switch ((<ƒ.Axis>_event.target).name) {
        case "TranslateX":
          this.translateX(output);
          break;
        case "TranslateY":
          this.translateY(output);
          break;
        case "TranslateZ":
          this.translateZ(output);
      }
    }
  }
}