namespace FudgeCore {
  export class Vertex {
    public position: Vector3;
    public uv: Vector2;

    public constructor(_position: Vector3, _uv: Vector2) {
      this.position = _position;
      this.uv = _uv;
    }
  }
}