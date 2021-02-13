namespace PhysikTest {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.Node {
    public readonly axisSpeed: f.Axis = new f.Axis("Speed", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: f.Axis = new f.Axis("Rotation", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 0.2; // units per second
    public maxRotSpeed: number = 180; // degrees per second
    public height: number = 0;
    public lookAt: f.Vector3 = f.Vector3.X(1);
    public meshTerrain: f.MeshTerrain;

    private groundClearance: number = 0.0225;

    public setUpAxis(): void {
      this.axisSpeed.setDelay(1000);
      this.axisRotation.setDelay(1000);
    }

    public update(_timeFrame: number): void {
      
      // let ray = this.meshTerrain.getPositionOnTerrain(this);
      // this.mtxLocal.translation = new f.Vector3(ray.origin.x, ray.origin.y + this.groundClearance, ray.origin.z);
      

      // let gradient: f.Vector3 = getGradient(ray.direction);
      // arrowRed.mtxLocal.translation = ray.origin;
      // arrowRed.mtxLocal.lookAt(f.Vector3.SUM(gradient, ray.origin));

      // let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      // let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;

      // ray.direction.normalize();

      // // if (! oldNormal.equals(ray.direction, 0.001) ){
      // //   // console.log(oldNormal.toString() + ray.direction.toString())
      // //   newUp = calculateNewUp(oldNormal, ray.direction, oldUp);
      // // }

      // this.mtxLocal.translateX(distance);
      // this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, ray.direction) /*, newUp */);

      // console.log(this.axisSpeed.getOutput());
      // this.mtxLocal.rotateZ(angle * distance * 200);

      // // this.mtxLocal.translateZ(distance /*+ 0.005*/);
      // // this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, this.mtxLocal.getZ()), ray.direction, true);
      // // this.mtxLocal.rotateY(angle /*+ 0.2*/);
    }
  }

  function getGradient(faceNormal: f.Vector3): f.Vector3{
    if(faceNormal.x == 0 && faceNormal.z == 0) return f.Vector3.Y(1);
    
    let yCuttingPlane: f.Vector3 = f.Vector3.CROSS(faceNormal, f.Vector3.Y(1));
    let gradient: f.Vector3 = f.Vector3.CROSS(faceNormal, yCuttingPlane)

    return f.Vector3.NORMALIZATION(gradient); 
  }
}