namespace ControlableCube {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.Node {
    public readonly axisSpeed: ƒ.Axis = new ƒ.Axis("Speed", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: ƒ.Axis = new ƒ.Axis("Rotation", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 5; // units per second
    public maxRotSpeed: number = 180; // degrees per second

    public setUpAxis(): void {
      this.axisSpeed.setDelay(500);
      this.axisRotation.setDelay(200);
    }

    public update(_timeFrame: number): void {
      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
      this.mtxLocal.translateZ(distance);
      this.mtxLocal.rotateY(angle);
    }
  }
}