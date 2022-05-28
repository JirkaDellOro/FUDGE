namespace FudgeAid {
  import ƒ = FudgeCore;

  export class CameraOrbit extends ƒ.Node {
    public readonly axisRotateX: ƒ.Axis = new ƒ.Axis("RotateX", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotateY: ƒ.Axis = new ƒ.Axis("RotateY", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisDistance: ƒ.Axis = new ƒ.Axis("Distance", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);

    public minDistance: number;
    public maxDistance: number;
    protected translator: ƒ.Node;
    protected rotatorX: ƒ.Node;
    private maxRotX: number;



    public constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart: number = 2, _maxRotX: number = 75, _minDistance: number = 1, _maxDistance: number = 10) {
      super("CameraOrbit");

      this.maxRotX = Math.min(_maxRotX, 89);
      this.minDistance = _minDistance;
      this.maxDistance = _maxDistance;

      let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      this.addComponent(cmpTransform);

      this.rotatorX = new ƒ.Node("CameraRotationX");
      this.rotatorX.addComponent(new ƒ.ComponentTransform());
      this.addChild(this.rotatorX);
      this.translator = new ƒ.Node("CameraTranslate");
      this.translator.addComponent(new ƒ.ComponentTransform());
      this.translator.mtxLocal.rotateY(180);
      this.rotatorX.addChild(this.translator);

      this.translator.addComponent(_cmpCamera);
      this.distance = _distanceStart;

      this.axisRotateX.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, this.hndAxisOutput);
      this.axisRotateY.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, this.hndAxisOutput);
      this.axisDistance.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, this.hndAxisOutput);
    }

    public get cmpCamera(): ƒ.ComponentCamera {
      return this.translator.getComponent(ƒ.ComponentCamera);
    }

    public get nodeCamera(): ƒ.Node {
      return this.translator;
    }

    public set distance(_distance: number) {
      let newDistance: number = Math.min(this.maxDistance, Math.max(this.minDistance, _distance));
      this.translator.mtxLocal.translation = ƒ.Vector3.Z(newDistance);
    }

    public get distance(): number {
      return this.translator.mtxLocal.translation.z;
    }

    public set rotationY(_angle: number) {
      this.mtxLocal.rotation = ƒ.Vector3.Y(_angle);
    }

    public get rotationY(): number {
      return this.mtxLocal.rotation.y;
    }

    public set rotationX(_angle: number) {
      _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
      this.rotatorX.mtxLocal.rotation = ƒ.Vector3.X(_angle);
    }

    public get rotationX(): number {
      return this.rotatorX.mtxLocal.rotation.x;
    }

    public rotateY(_delta: number): void {
      this.mtxLocal.rotateY(_delta);
    }

    public rotateX(_delta: number): void {
      this.rotationX = this.rotatorX.mtxLocal.rotation.x + _delta;
    }

    // set position of camera component relative to the center of orbit
    public positionCamera(_posWorld: ƒ.Vector3): void {
      let difference: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(_posWorld, this.mtxWorld.translation);
      let geo: ƒ.Geo3 = difference.geo;
      this.rotationY = geo.longitude;
      this.rotationX = -geo.latitude;
      this.distance = geo.magnitude;
    }


    public hndAxisOutput: EventListener = (_event: Event): void => {
      let output: number = (<CustomEvent>_event).detail.output;
      switch ((<ƒ.Axis>_event.target).name) {
        case "RotateX":
          this.rotateX(output);
          break;
        case "RotateY":
          this.rotateY(output);
          break;
        case "Distance":
          this.distance += output;
      }
    }
  }
}