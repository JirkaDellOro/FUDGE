/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  import ƒ = FudgeCore;

  export class CameraOrbit extends ƒ.Node {
    private maxRotX: number;
    private minDistance: number;
    private maxDistance: number;

    public constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart: number = 2, _maxRotX: number = 75, _minDistance: number = 1, _maxDistance: number = 10) {
      super("CameraOrbit");

      this.maxRotX = Math.min(_maxRotX, 89);
      this.minDistance = _minDistance;
      this.maxDistance = _maxDistance;

      let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      this.addComponent(cmpTransform);

      let rotatorX: ƒ.Node = new ƒ.Node("CameraRotX");
      rotatorX.addComponent(new ƒ.ComponentTransform());
      this.appendChild(rotatorX);

      rotatorX.addComponent(_cmpCamera);
      this.distance = _distanceStart;
    }

    public get cmpCamera(): ƒ.ComponentCamera {
      return this.rotatorX.getComponent(ƒ.ComponentCamera);
    }

    public get rotatorX(): ƒ.Node {
      return this.getChildrenByName("CameraRotX")[0];
    }

    public set distance(_distance: number) {
      let newDistance: number = Math.min(this.maxDistance, Math.max(this.minDistance, _distance));
      this.cmpCamera.pivot.translation = ƒ.Vector3.Z(newDistance);
    }

    public get distance(): number {
      return this.cmpCamera.pivot.translation.z;
    }

    public set rotationY(_angle: number) {
      this.cmpTransform.local.rotation = ƒ.Vector3.Y(_angle);
    }

    public get rotationY(): number {
      return this.cmpTransform.local.rotation.y;
    }

    public set rotationX(_angle: number) {
      _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
      this.rotatorX.cmpTransform.local.rotation = ƒ.Vector3.X(_angle);
    }

    public get rotationX(): number {
      return this.rotatorX.cmpTransform.local.rotation.x;
    }

    public rotateY(_delta: number): void {
      this.cmpTransform.local.rotateY(_delta);
    }

    public rotateX(_delta: number): void {
      this.rotationX = this.rotatorX.cmpTransform.local.rotation.x + _delta;
    }
  }
}