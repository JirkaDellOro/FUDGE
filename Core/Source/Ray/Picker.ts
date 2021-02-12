namespace FudgeCore {
  export class Picker {
    public static pickRay(_branch: Node, _ray: Ray, _min: number, _max: number): Pick[] {
      let cmpCameraPick: ComponentCamera = new ComponentCamera();
      cmpCameraPick.pivot.translation = _ray.origin;
      cmpCameraPick.pivot.lookAt(_ray.direction);
      cmpCameraPick.projectCentral(1, 0.001, FIELD_OF_VIEW.DIAGONAL, _min, _max);

      let size: number = Math.ceil(Math.sqrt(_branch.nNodesInBranch));
      Render.pickTexture = Render.createPickTexture(size, size);
      let picks: Pick[] = Render.drawGraphForPicking(_branch, cmpCameraPick);
      return picks;
    }

    public static pickCamera(_branch: Node, _cmpCamera: ComponentCamera, _posProjection: Vector2): Pick[] {
      let ray: Ray = new Ray(new Vector3(-_posProjection.x, _posProjection.y, 1));
      let mtxCamera: Matrix4x4 = _cmpCamera.pivot;
      if (_cmpCamera.getContainer())
        mtxCamera = Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.pivot);
      ray.transform(mtxCamera);

      let picks: Pick[] = Picker.pickRay(_branch, ray, _cmpCamera.getNear(), _cmpCamera.getFar());
      return picks;
    }

    public static pickViewport(_viewport: Viewport, _posClient: Vector2): Pick[] {
      let posProjection: Vector2 = _viewport.pointClientToProjection(_posClient);
      let picks: Pick[] = Picker.pickCamera(_viewport.getBranch(), _viewport.camera, posProjection);
      return picks;
    }
  }
}