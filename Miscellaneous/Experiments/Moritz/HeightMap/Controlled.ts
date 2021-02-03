namespace HeightMap {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.NodeCoordinateSystem {
    public readonly axisSpeed: f.Axis = new f.Axis("Speed", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: f.Axis = new f.Axis("Rotation", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 1; // units per second
    public maxRotSpeed: number = 90; // degrees per second
    public height: number = 0;
    public lookAt: f.Vector3 = f.Vector3.X(1);
    public meshTerrain: f.MeshTerrain;

    public setUpAxis(): void {
      this.axisSpeed.setDelay(0.0001);
      this.axisRotation.setDelay(1);
    }

    public update(_timeFrame: number): void {
      let oldUp = this.mtxLocal.getY();
      let oldNormal = this.mtxLocal.getZ();
      oldNormal.normalize();
      let newUp = oldUp;

      let ray = this.meshTerrain.getPositionOnTerrain(this);
      this.mtxLocal.translation = ray.origin;

      let gradient: f.Vector3 = f.Vector3.SCALE(getGradient(ray.direction), 0.002);
      arrowRed.mtxLocal.translation = ray.origin;
      arrowRed.mtxLocal.lookAt(f.Vector3.SUM(gradient, this.mtxLocal.translation));

      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;

      ray.direction.normalize();

      if (! oldNormal.equals(ray.direction, 0.001) ){
        console.log(oldNormal.toString() + ray.direction.toString())
        newUp = calculateNewUp(oldNormal, ray.direction, oldUp);
      }

      this.mtxLocal.translateX(distance /*+ 0.005*/);
      this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, ray.direction), newUp);


      this.mtxLocal.rotateZ(angle /*+ 0.2*/);

      // this.mtxLocal.translateZ(distance /*+ 0.005*/);
      // this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, this.mtxLocal.getZ()), ray.direction, true);
      // this.mtxLocal.rotateY(angle /*+ 0.2*/);
    }
  }

  function getGradient(faceNormal: f.Vector3): f.Vector3{
    if(faceNormal.x == 0 && faceNormal.z == 0) return f.Vector3.Y(1);
    
    let yCuttingPlane: f.Vector3 = f.Vector3.CROSS(faceNormal, f.Vector3.Y(1));
    let gradient: f.Vector3 = f.Vector3.CROSS(faceNormal, yCuttingPlane)

    return f.Vector3.NORMALIZATION(gradient); 
  }

  function calculateNewUp(oldNormal: f.Vector3, newNormal: f.Vector3, oldUp: f.Vector3): f.Vector3{
    let oldDirection = f.Vector3.CROSS(oldNormal, oldUp);
    let newUp = f.Vector3.CROSS(oldDirection, newNormal)
    return newUp;
  }
}