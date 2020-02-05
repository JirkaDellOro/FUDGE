namespace FudgeCore {
  /**
   * Attaches an [[AudioListener]] to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentAudioListener extends Component {
    public pivot: Matrix4x4 = Matrix4x4.IDENTITY;

    public update(_listener: AudioListener): void {
      let local: Matrix4x4 = this.pivot;
      if (this.getContainer())
         local = Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.pivot);
      
      _listener.setPosition(local.translation.x, local.translation.y, local.translation.z);

      let forward: Vector3 = Vector3.TRANSFORMATION(Vector3.Z(), local);
      let up: Vector3 = Vector3.TRANSFORMATION(Vector3.Y(), local);

      _listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);

      Debug.log(local.translation.toString(), forward.toString(), up.toString());
    }
  }
}
