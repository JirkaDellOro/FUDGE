namespace FudgeCore {
  /**
   * Generate a flat polygon
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
    public test2: Vector2 = new Vector2(1, 2);
    public test3: Vector3 = new Vector3(1, 2, 3);
    // protected construction: VectorArray = new VectorArray();
    protected construction: Vector2[] = [];
    protected fitMesh: boolean;
    protected fitTexture: boolean;

    public constructor(_name: string = "MeshPolygon", _vertices: Vector2[] = MeshPolygon.verticesDefault, _fitMesh: boolean = true, _fitTexture: boolean = true) {
      super(_name);
      this.construction = _vertices.map(_vertex => _vertex.copy);
      this.create(this.construction, _fitMesh, _fitTexture);
      // this.construction.entries = _vertices.map(_vertex => _vertex.copy);
      // this.create(this.construction.entries as Vector2[], _autofit);
    }

    public static fitMesh(_vertices: Vector2[]): Vector2[] {
      let result: Vector2[] = [];
      let min: Vector2 = Vector2.ZERO();
      let max: Vector2 = Vector2.ZERO();
      for (let vertex of _vertices) {
        min.x = Math.min(min.x, vertex.x);
        max.x = Math.max(max.x, vertex.x);
        min.y = Math.min(min.y, vertex.y);
        max.y = Math.max(max.y, vertex.y);
      }
      let center: Vector2 = new Vector2((min.x + max.x) / 2, (min.y + max.y) / 2);
      let size: Vector2 = new Vector2(max.x - min.x, max.y - min.y);

      for (let vertex of _vertices) {
        let adjusted: Vector2 = Vector2.DIFFERENCE(vertex, center);
        adjusted.x /= size.x;
        adjusted.y /= size.y;
        result.push(adjusted);
      }

      return result;
    }

    public create(_construction: Vector2[] = [], _fitMesh: boolean = true, _fitTexture: boolean = true): void {
      this.fitMesh = _fitMesh;
      this.fitTexture = _fitTexture;

      if (_construction.length < 3) {
        Debug.warn("At least 3 vertices needed to construct MeshPolygon, default trigon used");
        this.create(MeshPolygon.verticesDefault, true);
        return;
      }

      let construction: Vector2[] = this.fitMesh ? MeshPolygon.fitMesh(_construction) : _construction;

      let min: Vector2 = Vector2.ZERO();
      let max: Vector2 = Vector2.ZERO();
      let vertices: number[] = [];
      for (let vertex of construction) {
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
        for (let vertex of construction) {
          let textureUV: Vector2 = Vector2.SUM(vertex, min);
          textureUV.y *= -1;
          textureUVs.push(textureUV.x / size.x);
          textureUVs.push(textureUV.y / size.y);
        }
      } else {
        textureUVs = _construction.map(_vertex => [_vertex.x, -_vertex.y]).flat();
      }

      console.log(textureUVs);

      this.vertices = new Float32Array(vertices);
      this.textureUVs = new Float32Array(textureUVs);
      this.indices = this.createIndices();
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.construction = Serializer.serializeArray(Vector2, this.construction);
      serialization.test2 = this.test2.serialize();
      serialization.test3 = this.test3.serialize();
      serialization.fitMesh = this.fitMesh;
      serialization.fitTexture = this.fitTexture;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      // let vectorArray: VectorArray = <VectorArray>await (new VectorArray()).deserialize(_serialization.construction);
      let vectors: Vector2[] = <Vector2[]>await Serializer.deserializeArray(_serialization.construction);
      this.test2 = await (new Vector2()).deserialize(_serialization.test2);
      this.test3 = await (new Vector3()).deserialize(_serialization.test3);
      this.create(vectors, _serialization.fitMesh, _serialization.fitTexture);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      // let sectors: number = Math.round(_mutator.sectors);
      // let stacks: number = Math.round(_mutator.stacks);
      this.create(_mutator.construction, _mutator.autofit);
    }

    // public getMutator(): Mutator {
    //   let mutator: Mutator = {};//super.getMutator(true);
    //   // mutator.construction = this.construction;
    //   mutator.test = this.test.getMutator();
    //   return mutator;
    // }

    protected reduceMutator(_mutator: Mutator): void {
      // console.log(_mutator);
      // delete _mutator.construction;
    }
    //#endregion

    protected createVertices(): Float32Array {
      return this.vertices;
    }
    protected createTextureUVs(): Float32Array {
      return this.textureUVs;
    }
    protected createIndices(): Uint16Array {
      let indices: Array<number> = [];
      for (let i: number = 2; i < this.vertices.length / 3; i++)
        indices.push(0, i - 1, i);
      return new Uint16Array(indices);
    }
    protected createFaceNormals(): Float32Array {
      let normals: number[] = [];
      for (let i: number = 2; i < this.vertices.length / 3; i++)
        normals.push(0, 0, 1);
      return new Float32Array(normals);
    }
  }
}