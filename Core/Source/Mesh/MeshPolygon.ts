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
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022
   */
  export class MeshPolygon extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshPolygon);
    protected static shapeDefault: Vector2[] = [ // trigon is the minimal shape
      new Vector2(-1, -1),
      new Vector2(1, -1),
      new Vector2(0, 1)
    ];
    protected shape: MutableArray<Vector2> = new MutableArray<Vector2>(Vector2);
    protected fitTexture: boolean;

    public constructor(_name: string = "MeshPolygon", _shape: Vector2[] = MeshPolygon.shapeDefault, _fitTexture: boolean = true) {
      super(_name);
      this.create(_shape, _fitTexture);
    }

    protected get minVertices(): number {
      return 3;
    }

    public create(_shape: Vector2[] = [], _fitTexture: boolean = true): void {
      this.shape = <MutableArray<Vector2>>MutableArray.from(_shape.map(_vertex => _vertex.clone));
      this.clear();
      this.fitTexture = _fitTexture;

      if (_shape.length < this.minVertices) {
        Debug.warn(`At least ${this.minVertices} vertices needed to construct MeshPolygon, default trigon used`);
        this.create(MeshPolygon.shapeDefault, true);
        return;
      }

      let shape: Vector2[] = _shape;

      let min: Vector2 = Vector2.ZERO();
      let max: Vector2 = Vector2.ZERO();
      this.vertices = new Vertices();
      for (let vertex of shape) {
        this.vertices.push(new Vertex(vertex.toVector3()));

        min.x = Math.min(min.x, vertex.x);
        max.x = Math.max(max.x, vertex.x);
        min.y = Math.min(min.y, vertex.y);
        max.y = Math.max(max.y, vertex.y);
      }
      let size: Vector2 = new Vector2(max.x - min.x, max.y - min.y);

      if (this.fitTexture) {
        for (let i: number = 0; i < shape.length; i++) {
          let textureUV: Vector2 = Vector2.DIFFERENCE(shape[i], min);
          this.vertices[i].uv = new Vector2(textureUV.x / size.x, 1 - textureUV.y / size.y);
        }
      } else {
        _shape.forEach((_vertex, _i) => this.vertices[_i].uv = new Vector2(_vertex.x, -_vertex.y));
      }

      this.faces = [];
      for (let i: number = 2; i < this.vertices.length; i++)
        this.faces.push(new Face(this.vertices, i - 1, i, 0));
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
      this.create(this.shape, this.fitTexture);
      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion
  }
}