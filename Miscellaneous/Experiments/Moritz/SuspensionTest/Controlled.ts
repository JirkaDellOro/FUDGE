namespace SuspensionTest {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.Node {
    public readonly axisSpeed: f.Axis = new f.Axis("Speed", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: f.Axis = new f.Axis("Rotation", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 0.2; // units per second
    public maxRotSpeed: number = 180; // degrees per second
    public terrain: f.Node;
    public meshTerrain: f.MeshTerrain;

    private groundClearance: number = 0.025;

    public setUpAxis(): void {
      this.axisSpeed.setDelay(2000);
      this.axisRotation.setDelay(300);
    }

    public update(_timeFrame: number): void {
      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;

      this.mtxLocal.translateX(distance);
      this.mtxLocal.rotateZ(angle * distance * 50);

      let frontAxis: f.Node = this.getChildrenByName("Front Axis")[0];
      let rearAxis: f.Node = this.getChildrenByName("Rear Axis")[0];

      let steeringFL: f.Node = frontAxis.getChildrenByName("Tyre FL")[0];
      let steeringFR: f.Node = frontAxis.getChildrenByName("Tyre FR")[0];
      // let tyreBR: f.Node = rearAxis.getChildrenByName("Tyre BR")[0];
      // let tyreBL: f.Node = rearAxis.getChildrenByName("Tyre BL")[0];

      let tyreFL: f.Node = this.getChildrenByName("FL")[0];
      let tyreFR: f.Node = this.getChildrenByName("FR")[0];
      let tyreBR: f.Node = this.getChildrenByName("BR")[0];
      let tyreBL: f.Node = this.getChildrenByName("BL")[0];

      let posFL: f.PositionOnTerrain = this.meshTerrain.getPositionOnTerrain(tyreFL.mtxWorld.translation, this.terrain.mtxWorld);
      let posFR: f.PositionOnTerrain = this.meshTerrain.getPositionOnTerrain(tyreFR.mtxWorld.translation, this.terrain.mtxWorld);

      let posBR: f.PositionOnTerrain = this.meshTerrain.getPositionOnTerrain(tyreBR.mtxWorld.translation, this.terrain.mtxWorld);
      let posBL: f.PositionOnTerrain = this.meshTerrain.getPositionOnTerrain(tyreBL.mtxWorld.translation, this.terrain.mtxWorld);

      let vecFrontAxis: f.Vector3 = f.Vector3.DIFFERENCE(posFL.position, posFR.position);
      let vecRearAxis: f.Vector3 = f.Vector3.DIFFERENCE(posBL.position, posBR.position);

      vecFrontAxis = f.Vector3.SCALE(vecFrontAxis, 0.5);
      vecRearAxis = f.Vector3.SCALE(vecRearAxis, 0.5);

      let posFrontAxis: f.Vector3 = new f.Vector3(frontAxis.mtxWorld.translation.x, (posFL.position.y + posFR.position.y)/2 + this.groundClearance, frontAxis.mtxWorld.translation.z);
      let posRearAxis: f.Vector3 = new f.Vector3(rearAxis.mtxWorld.translation.x, (posBL.position.y + posBR.position.y)/2 + this.groundClearance, rearAxis.mtxWorld.translation.z);

      let vecMidAxis = f.Vector3.DIFFERENCE(posFrontAxis, posRearAxis);

      let frontNormal = f.Vector3.CROSS(vecMidAxis, vecFrontAxis);
      let backNormal = f.Vector3.CROSS(vecMidAxis, vecRearAxis);

      let chassisNormal: f.Vector3 = f.Vector3.SUM(f.Vector3.NORMALIZATION(frontNormal), f.Vector3.NORMALIZATION(backNormal));

      // console.log((posBL.position.y + posBR.position.y)/2 + this.groundClearance);
      this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, (posBL.position.y + posBR.position.y)/2 + this.groundClearance, this.mtxLocal.translation.z);

      // if(!backNormal.equals(f.Vector3.ZERO()) && !backNormal.equals(f.Vector3.ZERO())){
        
        frontNormal.transform(this.mtxWorldInverse, false)
        backNormal.transform(this.mtxWorldInverse, false)
        
        // chassisNormal.transform(this.mtxWorldInverse, false)

        this.mtxLocal.lookAt(f.Vector3.SUM(chassisNormal, this.mtxLocal.translation), );
        // arrowRed.mtxLocal.lookAt(f.Vector3.SUM(chassisNormal, this.mtxLocal.translation));
        frontAxis.mtxLocal.lookAt(f.Vector3.SUM(frontNormal, frontAxis.mtxLocal.translation), new f.Vector3(0,1,0));
        rearAxis.mtxLocal.lookAt(f.Vector3.SUM(backNormal, rearAxis.mtxLocal.translation), new f.Vector3(0,1,0));
        
        // this.mtxLocal.rotateY(chRot * 0.1);
        
      // }

      // frontAxis.mtxLocal.translation = new f.Vector3(frontAxis.mtxLocal.translation.x, frontAxis.mtxLocal.translation.y, (posFL.origin.y + posFR.origin.y)/2 + this.groundClearance);
      // rearAxis.mtxLocal.translation = new f.Vector3(rearAxis.mtxLocal.translation.x, rearAxis.mtxLocal.translation.y, (posBL.origin.y + posBR.origin.y)/2 + this.groundClearance);

      steeringFL.mtxLocal.rotation = new f.Vector3(0, 0, this.axisRotation.getOutput() * 15);
      steeringFR.mtxLocal.rotation = new f.Vector3(0, 0, this.axisRotation.getOutput() * 15);
      
      // showGradient(ray);
    }
  }

  function showGradient(ray: f.Ray): void{
    let gradient: f.Vector3 = getGradient(ray.direction);

    arrowRed.mtxLocal.translation = ray.origin;
    arrowRed.mtxLocal.lookAt(f.Vector3.SUM(gradient, ray.origin));
  }

  function getGradient(faceNormal: f.Vector3): f.Vector3{
    if(faceNormal.x == 0 && faceNormal.z == 0) return f.Vector3.Y(1);
    
    let yCuttingPlane: f.Vector3 = f.Vector3.CROSS(faceNormal, f.Vector3.Y(1));
    let gradient: f.Vector3 = f.Vector3.CROSS(faceNormal, yCuttingPlane)

    return f.Vector3.NORMALIZATION(gradient); 
  }
}
