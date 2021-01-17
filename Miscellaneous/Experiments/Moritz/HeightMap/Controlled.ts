namespace HeightMap {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.NodeCoordinateSystem {
    public readonly axisSpeed: f.Axis = new f.Axis("Speed", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: f.Axis = new f.Axis("Rotation", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 5; // units per second
    public maxRotSpeed: number = 180; // degrees per second
    public height: number;
    public lookAt: f.Vector3;

    public parentNode: f.Node;

    public setUpAxis(): void {
      this.axisSpeed.setDelay(500);
      this.axisRotation.setDelay(200);
    }

    public update(_timeFrame: number): void {
      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
      this.mtxLocal.translateX(distance);
      this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.height + 0.025, this.mtxLocal.translation.z);
      
      let test = f.Vector3.SUM(this.lookAt, this.mtxLocal.translation)
      let matrix = this.mtxLocal;
      let vecX = f.Vector3.TRANSFORMATION(new f.Vector3(0,1,0), matrix);
      vecX = f.Vector3.SUM(vecX, this.mtxLocal.translation)
      
      this.mtxLocal.lookAt( test);

      this.mtxLocal.rotateZ(angle);
      

    }
  }
}