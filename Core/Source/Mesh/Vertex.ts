namespace FudgeCore {
  export class Vertex {
    public position: Vector3;
    public uv: Vector2;
    public normal: Vector3;

    public constructor(_position: Vector3, _uv: Vector2 = null, _normal: Vector3 = null) {
      this.position = _position;
      this.uv = _uv;
      this.normal = _normal;
    }
  }
}