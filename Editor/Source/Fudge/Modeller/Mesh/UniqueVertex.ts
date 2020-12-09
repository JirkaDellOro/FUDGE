namespace Fudge {
  export class UniqueVertex {
    public position: ƒ.Vector3;
    // key is the index of the vertex in the vertices array, value is the position of the key in the indices
    public vertexToIndices: Map<number, {indices: number[], face?: number}>;

    constructor(_position: ƒ.Vector3, _vertexToIndices: Map<number, {indices: number[], face?: number}>) {
      this.position = _position;
      this.vertexToIndices = _vertexToIndices;
    }
  }
}