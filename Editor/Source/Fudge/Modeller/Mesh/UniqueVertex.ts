namespace Fudge {
  export class UniqueVertex {
    public position: ƒ.Vector3;
    // key is the index of the vertex in the vertices array, value is the position of the key in the indices
    public indices: Record<number, number[]>;

    constructor(_position: ƒ.Vector3, _indices: Record<number, number[]>) {
      this.position = _position;
      this.indices = _indices;
    }
  }
}