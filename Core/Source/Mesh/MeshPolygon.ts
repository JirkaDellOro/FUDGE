namespace FudgeCore {
  /**
   * Generate a flat polygon. All trigons share vertex 0, so careful design is required to create concave polygons. 
   * Vertex 0 is also associated with the face normal.
   * ```plaintext
   *             0 
   *           1╱|╲  4 ...
   *            ╲|_╲╱ 
   *            2   3
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MeshPolygon extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshPolygon);
    protected static verticesDefault: Vector2[] = [ // trigon is the minimal shape
      new Vector2(-1, -1),
      new Vector2(1, -1),
      new Vector2(0, 1)
    ];
    protected shape: MutableArray<Vector2> = new MutableArray<Vector2>();
    protected fitTexture: boolean;

    public constructor(_name: string = "MeshPolygon", _shape: Vector2[] = MeshPolygon.verticesDefault, _fitTexture: boolean = true) {
      super(_name);
      this.create(_shape, _fitTexture);
    }

    // private static fitMesh(_vertices: Vector2[]): Vector2[] {
    //   let result: Vector2[] = [];
    //   let min: Vector2 = Vector2.ZERO();
    //   let max: Vector2 = Vector2.ZERO();
    //   for (let vertex of _vertices) {
    //     min.x = Math.min(min.x, vertex.x);
    //     max.x = Math.max(max.x, vertex.x);
    //     min.y = Math.min(min.y, vertex.y);
    //     max.y = Math.max(max.y, vertex.y);
    //   }
    //   let center: Vector2 = new Vector2((min.x + max.x) / 2, (min.y + max.y) / 2);
    //   let size: Vector2 = new Vector2(max.x - min.x, max.y - min.y);

    //   for (let vertex of _vertices) {
    //     let adjusted: Vector2 = Vector2.DIFFERENCE(vertex, center);
    //     adjusted.x /= size.x;
    //     adjusted.y /= size.y;
    //     result.push(adjusted);
    //   }

    //   return result;
    // }

    protected get minVertices(): number {
      return 3;
    }

    public create(_shape: Vector2[] = [], _fitTexture: boolean = true): void {
      this.shape = <MutableArray<Vector2>>MutableArray.from(_shape.map(_vertex => _vertex.clone));
      this.clear();
      this.fitTexture = _fitTexture;

      if (_shape.length < this.minVertices) {
        Debug.warn(`At least ${this.minVertices} vertices needed to construct MeshPolygon, default trigon used`);
        this.create(MeshPolygon.verticesDefault, true);
        return;
      }

      let shape: Vector2[] = _shape;

      let min: Vector2 = Vector2.ZERO();
      let max: Vector2 = Vector2.ZERO();
      let vertices: number[] = [];
      for (let vertex of shape) {
        vertices.push(vertex.x);
        vertices.push(vertex.y);
        vertices.push(0);

        min.x = Math.min(min.x, vertex.x);
        max.x = Math.max(max.x, vertex.x);
        min.y = Math.min(min.y, vertex.y);
        max.y = Math.max(max.y, vertex.y);
      }
      let size: Vector2 = new Vector2(max.x - min.x, max.y - min.y);

      let textureUVs: number[] = [];
      if (this.fitTexture) {
        for (let vertex of shape) {
          let textureUV: Vector2 = Vector2.SUM(vertex, min);
          textureUV.y *= -1;
          textureUVs.push(textureUV.x / size.x);
          textureUVs.push(textureUV.y / size.y);
        }
      } else {
        textureUVs = _shape.map(_vertex => [_vertex.x, -_vertex.y]).flat();
      }

      // console.log(textureUVs);

      this.ƒvertices = new Float32Array(vertices);
      this.ƒtextureUVs = new Float32Array(textureUVs);
      this.ƒindices = this.createIndices();
      // this.ƒnormalsFace = this.createFaceNormals();
      // this.createRenderBuffers();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.shape = Serializer.serializeArray(Vector2, this.shape);
      serialization.fitTexture = this.fitTexture;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      let vectors: Vector2[] = <Vector2[]>await Serializer.deserializeArray(_serialization.shape);
      this.create(vectors, _serialization.fitTexture);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      await super.mutate(_mutator);
      this.create(this.shape, _mutator.fitTexture);
      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion

    protected createIndices(): Uint16Array {
      let indices: Array<number> = [];
      for (let i: number = 2; i < this.vertices.length / 3; i++)
        indices.push(0, i - 1, i);
      return new Uint16Array(indices);
    }

  }
}