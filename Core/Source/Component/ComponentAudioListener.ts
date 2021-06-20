namespace FudgeCore {
  /**
   * Serves to set the spatial location and orientation of AudioListeners relative to the
   * world transform of the {@link Node} it is attached to.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentAudioListener extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAudioListener);
    public mtxPivot: Matrix4x4 = Matrix4x4.IDENTITY();

    /**
     * Updates the position and orientation of the given AudioListener
     */
    public update(_listener: AudioListener): void {
      let mtxResult: Matrix4x4 = this.mtxPivot;
      if (this.getContainer())
        mtxResult = Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.mtxPivot);

      // Debug.log(mtxResult.toString());
      let position: Vector3 = mtxResult.translation;
      let forward: Vector3 = Vector3.TRANSFORMATION(Vector3.Z(1), mtxResult, false);
      let up: Vector3 = Vector3.TRANSFORMATION(Vector3.Y(), mtxResult, false);

      _listener.positionX.value = position.x;
      _listener.positionY.value = position.y;
      _listener.positionZ.value = position.z;

      _listener.forwardX.value = forward.x;
      _listener.forwardY.value = forward.y;
      _listener.forwardZ.value = forward.z;

      _listener.upX.value = up.x;
      _listener.upY.value = up.y;
      _listener.upZ.value = up.z;

      // Debug.log(mtxResult.translation.toString(), forward.toString(), up.toString());
    }
  }
}
