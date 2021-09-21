///<reference path="MeshPolygon.ts"/>
namespace FudgeCore {
  /**
   * Generates a rotation of a polygon around the y-axis
   * ```plaintext  
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MeshRotation extends MeshPolygon {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshRotation);
    protected static verticesDefault: Vector2[] = [ // line is the minimal shape
      new Vector2(0.5, 0.5),
      new Vector2(0.5, -0.5)
    ];
    private sectors: number;

    public constructor(_name: string = "MeshRotation", _vertices: Vector2[] = MeshRotation.verticesDefault, _sectors: number = 3, _fitTexture: boolean = true) {
      super(_name, _vertices, _fitTexture);
      this.rotate(_sectors);
      // console.log("Mutator", this.getMutator());
    }

    protected get minVertices(): number {
      return 2;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.sectors = this.sectors;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.sectors = _serialization.sectors;
      this.rotate(this.sectors);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      await super.mutate(_mutator);
      this.rotate(this.sectors);
      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion

    private rotate(_sectors: number): void {
      this.sectors = Math.round(_sectors);
      let angle: number = 360 / this.sectors;
      let mtxRotate: Matrix4x4 = Matrix4x4.ROTATION_Y(angle);
      // save original polygon
      let polygon: Vector3[] = [];
      for (let i: number = 0; i < this.vertices.length; i += 3)
        polygon.push(new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));

      let nVerticesPolygon: number = polygon.length;
      // let nFacesPolygon: number = nVerticesPolygon - 2;
      // let nIndicesPolygon: number = nFacesPolygon * 3;

      let vertices: Vector3[] = [];
      for (let sector: number = 0; sector <= this.sectors; sector++) {
        vertices.push(...polygon.map((_vector: Vector3) => _vector.clone));
        polygon.forEach((_vector: Vector3) => _vector.transform(mtxRotate));
        // vertices.push(...polygon.map((_vector: Vector3) => _vector.copy));
      }

      // copy indices to new index array
      let indices: number[] = [];

      for (let sector: number = 0; sector < this.sectors; sector++) {
        for (let quad: number = 0; quad < nVerticesPolygon - 1; quad++) {
          let start: number = sector * nVerticesPolygon + quad;
          let quadIndices: number[] = [start + 1, start + 1 + nVerticesPolygon, start + nVerticesPolygon, start];
          indices.push(...Mesh.getTrigonsFromQuad(quadIndices));
        }
      }
      Mesh.deleteInvalidIndices(indices, vertices);


      let textureUVs: number[] = [];
      for (let sector: number = 0; sector <= this.sectors; sector++) {
        for (let i: number = 0; i < nVerticesPolygon; i++) {
          let u: number = sector / this.sectors;
          let v: number = i * 1 / (nVerticesPolygon - 1);
          textureUVs.push(u, v);
        }
      }

      this.ƒvertices = new Float32Array(vertices.map((_v: Vector3) => [_v.x, _v.y, _v.z]).flat());
      this.ƒindices = new Uint16Array(indices);
      this.ƒtextureUVs = new Float32Array(textureUVs);
    }
  }
}