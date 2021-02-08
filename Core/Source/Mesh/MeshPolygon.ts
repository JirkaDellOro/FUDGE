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
    protected construction: Vector2[];
    protected autofit: boolean;

    public constructor(_name: string = "MeshPolygon", _vertices: Vector2[] = MeshPolygon.verticesDefault, _autofit: boolean = true) {
      super(_name);
      this.construction = _vertices.map(_vertex => _vertex.copy);
      this.autofit = _autofit;
      this.create(this.construction, _autofit);
    }

    public static autofit(_vertices: Vector2[]): Vector2[] {
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

    public create(_construction?: Vector2[], _autofit: boolean = true): void {
      if (_construction.length < 3) {
        Debug.warn("At least 3 vertices needed to construct MeshPolygon, default trigon used");
        this.create(MeshPolygon.verticesDefault, true);
        return;
      }

      if (_autofit)
        _construction = MeshPolygon.autofit(_construction);

      let min: Vector2 = Vector2.ZERO();
      let max: Vector2 = Vector2.ZERO();
      let vertices: number[] = [];
      for (let vertex of _construction) {
        vertices.push(vertex.x);
        vertices.push(vertex.y);
        vertices.push(0);

        min.x = Math.min(min.x, vertex.x);
        max.x = Math.max(max.x, vertex.x);
        min.y = Math.min(min.y, vertex.y);
        max.y = Math.max(max.y, vertex.y);
      }
      let center: Vector2 = new Vector2((min.x + max.x) / 2, (min.y + max.y) / 2);
      let size: Vector2 = new Vector2(max.x - min.x, max.y - min.y);

      let textureUVs: number[] = [];
      for (let vertex of _construction) {
        let textureUV: Vector2 = Vector2.SUM(vertex, center);
        textureUVs.push(textureUV.x / size.x);
        textureUVs.push(textureUV.y / size.y);
      }

      this.vertices = new Float32Array(vertices);
      this.textureUVs = new Float32Array(textureUVs);
      this.indices = this.createIndices();
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.construction = this.construction.map(_vertex => _vertex.serialize());
      serialization.autofit = this.autofit;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      let construction: Vector2[] = _serialization.construction.map(
        (_entry: Serialization) => {
          let parse: number[] = JSON.parse(<string><unknown>_entry);
          return new Vector2(parse[0], parse[1]);
        });
      this.create(construction, _serialization.autofit);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      // let sectors: number = Math.round(_mutator.sectors);
      // let stacks: number = Math.round(_mutator.stacks);
      this.create(_mutator.construction, _mutator.autofit);
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