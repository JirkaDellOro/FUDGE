namespace FudgeCore {
  export class Pick {
    // public face: number;
    public node: Node;
    public zBuffer: number;
    public luminance: number;
    public alpha: number;
    private ƒmtxViewToWorld: Matrix4x4;
    private ƒposition: Vector3;

    constructor(_node: Node) {
      this.node = _node;
    }

    public get position(): Vector3 {
      if (this.ƒposition)
        return this.ƒposition;
      let pointInClipSpace: Vector3 = Vector3.Z(this.zBuffer);
      let m: Float32Array = this.ƒmtxViewToWorld.get();
      let result: Vector3 = Vector3.TRANSFORMATION(pointInClipSpace, this.ƒmtxViewToWorld, true);
      let w: number = m[3] * pointInClipSpace.x + m[7] * pointInClipSpace.y + m[11] * pointInClipSpace.z + m[15];
      result.scale(1 / w);

      this.ƒposition = result;
      return result;
    }
  }
}