namespace HeightMap {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  export class Controlled extends ƒAid.Node {
    public readonly axisSpeed: f.Axis = new f.Axis("Speed", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public readonly axisRotation: f.Axis = new f.Axis("Rotation", 1, f.CONTROL_TYPE.PROPORTIONAL);
    public maxSpeed: number = 0.2; // units per second
    public maxRotSpeed: number = 180; // degrees per second
    public height: number = 0;
    public lookAt: f.Vector3 = f.Vector3.X(1);
    public terrain: f.Node;
    public meshTerrain: f.MeshTerrain;

    private groundClearance: number = 0.0225;

    public setUpAxis(): void {
      this.axisSpeed.setDelay(1000);
      this.axisRotation.setDelay(1000);
    }

    public update(_timeFrame: number): void {
      let distance: number = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
      let angle: number = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;

      let ray = this.meshTerrain.getPositionOnTerrain(this.mtxWorld.translation, this.terrain.mtxWorld);

      let tyreFL: f.Node = this.getChildrenByName("Tyre FL")[0];

      let posFL: f.Ray = this.meshTerrain.getPositionOnTerrain(tyreFL.mtxWorld.translation, this.terrain.mtxWorld);

      // console.log("mtxWorld: " + tyreFL.mtxWorld.translation.toString())
      // console.log("posTerrain: " + posFL.origin.toString())
      
      let posFLLocal = f.Vector3.TRANSFORMATION(posFL.origin, this.mtxWorldInverse);

      console.log("mtxLocal: " + tyreFL.mtxLocal.translation.toString())
      console.log("posTerrain: " + posFLLocal.toString())

      tyreFL.mtxLocal.translation = new f.Vector3(tyreFL.mtxLocal.translation.x, tyreFL.mtxLocal.translation.y, posFLLocal.z);
      
      
      
      // console.log("pos: " + posFL.origin.toString() + " Tyre world: " + tyreFL.mtxWorld.translation.toString());
      // console.log("Tyre Local: " + tyreFL.mtxLocal.translation + " pos Local: " + posFLLocal.toString());

      this.mtxLocal.translation = new f.Vector3(ray.origin.x, ray.origin.y + this.groundClearance, ray.origin.z);

      this.mtxLocal.translateX(distance);
      this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, ray.direction));

      this.getChildrenByName("Tyre FL")[0].mtxLocal.rotation = new f.Vector3(90, 0, this.axisRotation.getOutput() * 15);
      this.getChildrenByName("Tyre FR")[0].mtxLocal.rotation = new f.Vector3(90, 0, this.axisRotation.getOutput() * 15);
      
      this.mtxLocal.rotateZ(angle * distance * 200);
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