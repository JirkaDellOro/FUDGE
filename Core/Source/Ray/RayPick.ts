namespace FudgeCore {
  export class RayPick extends Ray {
    private cmpCamera: ComponentCamera;
    private cmpCameraPick: ComponentCamera;

    constructor(_cmpCamera: ComponentCamera) {
      super();
      this.cmpCameraPick = new ComponentCamera();
      this.camera = _cmpCamera;
    }

    public set camera(_cmpCamera: ComponentCamera) {
      this.cmpCamera = _cmpCamera;
    }
    public get camera(): ComponentCamera {
      return this.cmpCamera;
    }

    public pick(_branch: Node, _posProjection: Vector2): Pick[] {
      this.direction = new Vector3(-_posProjection.x, _posProjection.y, 1);
      this.direction.transform(this.cmpCamera.pivot);

      this.cmpCameraPick.pivot.translation = this.cmpCamera.pivot.translation;
      this.cmpCameraPick.pivot.lookAt(this.direction);
      this.cmpCameraPick.projectCentral(1, 0.001, FIELD_OF_VIEW.DIAGONAL); //, this.camera.getNear(), this.camera.getFar());
      // console.log("PickCamera", this.cmpCameraPick.pivot.translation.toString(), this.cmpCameraPick.pivot.getZ().toString());

      let size: number = Math.ceil(Math.sqrt(_branch.nNodesInBranch));
      Render.pickTexture = Render.createPickTexture(size, size);
      let picks: Pick[] = Render.drawGraphForPicking(_branch, this.cmpCameraPick);

      return picks;
    }
  }
}