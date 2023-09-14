namespace FudgeCore {

  export interface Bone {
    index: number;
    weight: number;
  }

  /**
   * Represents a vertex of a mesh with extended information such as the uv coordinates and the vertex normal.
   * It may refer to another vertex via an index into some array, in which case the position and the normal are stored there.
   * This way, vertex position and normal is a 1:1 association, vertex to texture coordinates a 1:n association.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   */
  export class Vertex {
    public position: Vector3;
    public uv: Vector2;
    public normal: Vector3;
    public color: Color;
    public referTo: number;
    public bones: Bone[];

    public constructor(_positionOrIndex: Vector3 | number, _uv: Vector2 = undefined, _normal: Vector3 = Vector3.ZERO(), _color: Color = new Color(1, 1, 1, 1), _bones: Bone[] = null) {
      if (_positionOrIndex instanceof Vector3)
        this.position = _positionOrIndex;
      else
        this.referTo = _positionOrIndex;

      this.uv = _uv;
      this.normal = _normal;
      this.color = _color;
      this.bones = _bones;
    }
  }
}