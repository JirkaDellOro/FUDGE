namespace HeightMap {
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
      this.axisSpeed.setDelay(1000);
      this.axisRotation.setDelay(1000);
    }

    public update(_timeFrame: number): void {
      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;

      let ray = this.meshTerrain.getPositionOnTerrain(this.mtxWorld.translation, this.terrain.mtxWorld);

      let frontAxis: f.Node = this.getChildrenByName("Front Axis")[0];
      let rearAxis: f.Node = this.getChildrenByName("Rear Axis")[0];

      let tyreFL: f.Node = frontAxis.getChildrenByName("Tyre FL")[0];
      let tyreFR: f.Node = frontAxis.getChildrenByName("Tyre FR")[0];
      let tyreBR: f.Node = rearAxis.getChildrenByName("Tyre BR")[0];
      let tyreBL: f.Node = rearAxis.getChildrenByName("Tyre BL")[0];

      let posFL: f.Ray = this.meshTerrain.getPositionOnTerrain(tyreFL.mtxWorld.translation, this.terrain.mtxWorld);
      let posFR: f.Ray = this.meshTerrain.getPositionOnTerrain(tyreFR.mtxWorld.translation, this.terrain.mtxWorld);
      let posBR: f.Ray = this.meshTerrain.getPositionOnTerrain(tyreBR.mtxWorld.translation, this.terrain.mtxWorld);
      let posBL: f.Ray = this.meshTerrain.getPositionOnTerrain(tyreBL.mtxWorld.translation, this.terrain.mtxWorld);
      
      // let posFLLocal = f.Vector3.TRANSFORMATION(posFL.origin, frontAxis.mtxWorldInverse);
      // let posFRLocal = f.Vector3.TRANSFORMATION(posFR.origin, frontAxis.mtxWorldInverse);
      // let posBRLocal = f.Vector3.TRANSFORMATION(posBR.origin, rearAxis.mtxWorldInverse);
      // let posBLLocal = f.Vector3.TRANSFORMATION(posBL.origin, rearAxis.mtxWorldInverse);

      // tyreFL.mtxLocal.translation = new f.Vector3(tyreFL.mtxLocal.translation.x, tyreFL.mtxLocal.translation.y, posFLLocal.z);
      // tyreFR.mtxLocal.translation = new f.Vector3(tyreFR.mtxLocal.translation.x, tyreFR.mtxLocal.translation.y, posFRLocal.z);
      // tyreBR.mtxLocal.translation = new f.Vector3(tyreBR.mtxLocal.translation.x, tyreBR.mtxLocal.translation.y, posBRLocal.z);
      // tyreBL.mtxLocal.translation = new f.Vector3(tyreBL.mtxLocal.translation.x, tyreBL.mtxLocal.translation.y, posBLLocal.z);

      let vecFrontAxis: f.Vector3 = f.Vector3.DIFFERENCE(posFL.origin, posFR.origin);
      let vecRearAxis: f.Vector3 = f.Vector3.DIFFERENCE(posBL.origin, posBR.origin);

      vecFrontAxis = f.Vector3.SCALE(vecFrontAxis, 0.5);
      vecRearAxis = f.Vector3.SCALE(vecRearAxis, 0.5);
      
      let midAxis = f.Vector3.DIFFERENCE(f.Vector3.SUM( posFR.origin, vecFrontAxis), f.Vector3.SUM( posBR.origin, vecRearAxis));

      let frontNormal = f.Vector3.CROSS(midAxis, vecFrontAxis);
      let rearNormal = f.Vector3.CROSS(midAxis, vecRearAxis);

      // this.mtxLocal.translation = new f.Vector3(ray.origin.x, ray.origin.y + this.groundClearance, ray.origin.z);

      let posLocalFrontAxis = f.Vector3.TRANSFORMATION(f.Vector3.SUM(posFR.origin, vecFrontAxis), this.mtxWorldInverse, true);
      let posLocalRearAxis = f.Vector3.TRANSFORMATION(f.Vector3.SUM(posBR.origin, vecRearAxis), this.mtxWorldInverse, true);

      frontAxis.mtxLocal.translation = new f.Vector3(frontAxis.mtxLocal.translation.x, frontAxis.mtxLocal.translation.y, posLocalFrontAxis.z);
      rearAxis.mtxLocal.translation = new f.Vector3(rearAxis.mtxLocal.translation.x, rearAxis.mtxLocal.translation.y, posLocalRearAxis.z);

      // f.RenderManager.setupTransformAndLights(graph);

      // arrowRed.mtxLocal.translation = tyreFL.mtxWorld.translation;
      // arrowRed.mtxLocal.lookAt(f.Vector3.SUM(frontNormal, tyreFL.mtxWorld.translation));
      

      if(!frontNormal.equals(f.Vector3.ZERO())){
        frontNormal.transform(frontAxis.mtxWorldInverse, false);
        rearNormal.transform(rearAxis.mtxWorldInverse, false);
        
        // console.log(f.Vector3.NORMALIZATION(frontNormal).toString())
        arrowRed.mtxLocal.lookAt(rearNormal, arrowRed.mtxLocal.getX());
        
        frontAxis.mtxLocal.lookAt(f.Vector3.SUM(frontNormal, frontAxis.mtxLocal.translation), new f.Vector3(0,1,0));
        rearAxis.mtxLocal.lookAt(f.Vector3.SUM(rearNormal, rearAxis.mtxLocal.translation), new f.Vector3(0,1,0));
      }

      frontAxis.mtxLocal.translation = new f.Vector3(frontAxis.mtxLocal.translation.x, frontAxis.mtxLocal.translation.y, frontAxis.mtxLocal.translation.z + this.groundClearance);
      rearAxis.mtxLocal.translation = new f.Vector3(rearAxis.mtxLocal.translation.x, rearAxis.mtxLocal.translation.y, rearAxis.mtxLocal.translation.z + this.groundClearance);

      

      // let dist = f.Vector3.DIFFERENCE(posFL.origin, posFR.origin);
      // console.log(dist.magnitude);

      this.mtxLocal.translateX(distance);
      // this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, ray.direction));
      this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, f.Vector3.Y(1)));

      // tyreFL.mtxLocal.rotation = new f.Vector3(90, 0, this.axisRotation.getOutput() * 15);
      // tyreFR.mtxLocal.rotation = new f.Vector3(90, 0, this.axisRotation.getOutput() * 15);
      
      this.mtxLocal.rotateZ(angle * distance * 50);
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