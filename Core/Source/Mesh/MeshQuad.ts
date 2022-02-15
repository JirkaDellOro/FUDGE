namespace FudgeCore {
  /**
   * Generate a simple quad with edges of length 1, the face consisting of two trigons
   * ```plaintext
   *        0 __ 3
   *         |_\|
   *        1    2             
   * ``` 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019-2022
   */
  export class MeshQuad extends MeshPolygon {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshQuad);

    public constructor(_name: string = "MeshQuad") {
      super(_name, [new Vector2(-0.5, 0.5), new Vector2(-0.5, -0.5), new Vector2(0.5, -0.5), new Vector2(0.5, 0.5)]);
    }

    // flat equals smooth
    public get verticesFlat(): Float32Array { return this.vertices; }
    public get indicesFlat(): Uint16Array { return this.indices; }
    public get normalsFlat(): Float32Array { return this.normalsVertex; }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.shape;
      delete _mutator.fitTexture;
    }
  }
}