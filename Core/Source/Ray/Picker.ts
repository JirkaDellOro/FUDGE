namespace FudgeCore {
  /**
   * Provides static methods for picking using {@link Render}
   * 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class Picker {
    /**
     * Takes a ray plus min and max values for the near and far planes to construct the picker-camera,
     * then renders the pick-texture and returns an unsorted {@link Pick}-array with information about the hits of the ray.
     */
    public static pickRay(_branch: Node, _ray: Ray, _min: number, _max: number): Pick[] {
      let cmpCameraPick: ComponentCamera = new ComponentCamera();
      cmpCameraPick.mtxPivot.translation = _ray.origin;
      cmpCameraPick.mtxPivot.lookAt(_ray.direction);
      cmpCameraPick.projectCentral(1, 0.001, FIELD_OF_VIEW.DIAGONAL, _min, _max);

      let picks: Pick[] = Render.pickBranch(_branch, cmpCameraPick);
      return picks;
    }

    /**
     * Takes a camera and a point on its virtual normed projection plane (distance 1) to construct the picker-camera,
     * then renders the pick-texture and returns an unsorted {@link Pick}-array with information about the hits of the ray.
     */
    public static pickCamera(_branch: Node, _cmpCamera: ComponentCamera, _posProjection: Vector2): Pick[] {
      let ray: Ray = new Ray(new Vector3(-_posProjection.x, _posProjection.y, 1));
      let length: number = ray.direction.magnitude;

      if (_cmpCamera.node) {
        let mtxCamera: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.node.mtxWorld, _cmpCamera.mtxPivot);
        ray.transform(mtxCamera);
        Recycler.store(mtxCamera);
      }
      else
        ray.transform(_cmpCamera.mtxPivot);


      let picks: Pick[] = Picker.pickRay(_branch, ray, length * _cmpCamera.getNear(), length * _cmpCamera.getFar());
      return picks;
    }

    /**
     * Takes the camera of the given viewport and a point the client surface to construct the picker-camera,
     * then renders the pick-texture and returns an unsorted {@link Pick}-array with information about the hits of the ray.
     */
    public static pickViewport(_viewport: Viewport, _posClient: Vector2): Pick[] {
      let posProjection: Vector2 = _viewport.pointClientToProjection(_posClient);
      let picks: Pick[] = Picker.pickCamera(_viewport.getBranch(), _viewport.camera, posProjection);
      return picks;
    }
  }
}