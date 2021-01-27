namespace HeightMap {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.Node {
    public readonly axisSpeed: f.Axis = new f.Axis("Speed", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: f.Axis = new f.Axis("Rotation", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 1; // units per second
    public maxRotSpeed: number = 90; // degrees per second
    public height: number = 0;
    public lookAt: f.Vector3 = f.Vector3.X(1);
    public meshTerrain: f.MeshTerrain;

    public setUpAxis(): void {
      this.axisSpeed.setDelay(500);
      this.axisRotation.setDelay(200);
    }

    public update(_timeFrame: number): void {
      let ray = this.meshTerrain.getPositionOnTerrain(this);
      this.height = ray.origin.y;
      this.lookAt = ray.direction;

      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
      this.mtxLocal.translateX(distance /*+ 0.005*/);
      this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.height + 0.025, this.mtxLocal.translation.z);
      
      let direction = f.Vector3.SUM(this.lookAt, this.mtxLocal.translation);
      
      this.mtxLocal.lookAt( direction, this.mtxLocal.getY());

      // console.log(this.mtxLocal.getX().toString());

      this.mtxLocal.rotateZ(angle /*+ 0.2*/);
      

    }

    public setLookAt(lookAt: f.Vector3){
      
    }
  }
}