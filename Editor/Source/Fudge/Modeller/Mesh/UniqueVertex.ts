namespace Fudge {
  /* 
    combines multiple vertices at the same position into one,
    so that they can be manipulated together
  */
  export class UniqueVertex extends ƒ.Mutable {
    public position: ƒ.Vector3;
    // key is the index of the vertex in the vertices array, value is the position of the key in the indices
    public vertexToData: Map<number, {indices: number[], face?: number, edges?: number[]}>;

    constructor(_position: ƒ.Vector3, _vertexToData: Map<number, {indices: number[], face?: number, edges?: number[]}>) {
      super();
      this.position = _position;
      this.vertexToData = _vertexToData;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {
      delete _mutator.vertexToIndices;
    }
  }
}