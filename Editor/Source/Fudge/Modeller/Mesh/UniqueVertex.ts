namespace Fudge {
  export class UniqueVertex extends ƒ.Mutable {
    public position: ƒ.Vector3;
    // key is the index of the vertex in the vertices array, value is the position of the key in the indices
    public vertexToIndices: Map<number, {indices: number[], face?: number}>;

    constructor(_position: ƒ.Vector3, _vertexToIndices: Map<number, {indices: number[], face?: number}>) {
      super();
      this.position = _position;
      this.vertexToIndices = _vertexToIndices;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {
      delete _mutator.vertexToIndices;
    }

  }
}