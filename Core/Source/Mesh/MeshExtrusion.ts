///<reference path="MeshPolygon.ts"/>
namespace FudgeCore {
  /**
   * Generates an extrusion of a polygon by a series of transformations
   * ```plaintext  
   *                      ____
   * Polygon         ____╱╲   ╲   
   * Transform 0  → ╱ ╲__╲_╲___╲ ← Transform 2
   *                ╲_╱__╱ ╱   ╱ 
   *     Transform 1  →  ╲╱___╱
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MeshExtrusion extends MeshPolygon {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshExtrusion);
    protected static transformsDefault: Matrix4x4[] = [ // offset of +0.5z and -0.5z as default
      Matrix4x4.TRANSLATION(Vector3.Z(0.5)),
      Matrix4x4.TRANSLATION(Vector3.Z(-0.5))
    ];
    private transforms: MutableArray<Matrix4x4> = new MutableArray<Matrix4x4>();
    // private transforms: MutableArray<Matrix4x4> = new MutableArray(Matrix4x4);

    public constructor(_name: string = "MeshExtrusion", _vertices: Vector2[] = MeshPolygon.verticesDefault, _transforms: Matrix4x4[] = MeshExtrusion.transformsDefault, _fitMesh: boolean = true, _fitTexture: boolean = true) {
      super(_name, _vertices, _fitMesh, _fitTexture);
      this.extrude(_transforms);
      console.log("Mutator", this.getMutator());
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        transforms: Serializer.serializeArray(Matrix4x4, this.transforms),
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      let transforms: Matrix4x4[];
      if (_serialization.transforms)
        transforms = <Matrix4x4[]>await Serializer.deserializeArray(_serialization.transforms);
      this.extrude(transforms);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      await super.mutate(_mutator);
      this.extrude(this.transforms);
      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion


    private extrude(_transforms: Matrix4x4[] = MeshExtrusion.transformsDefault): void {
      this.transforms = <MutableArray<Matrix4x4>>MutableArray.from(<MutableArray<Matrix4x4>>_transforms);

      // save original polygon
      let polygon: Vector3[] = [];
      for (let i: number = 0; i < this.vertices.length; i += 3)
        polygon.push(new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));

      let nTransforms: number = _transforms.length;
      let nVerticesPolygon: number = polygon.length;

      let nFacesPolygon: number = nVerticesPolygon - 2;
      let nIndicesPolygon: number = nFacesPolygon * 3;

      let vertices: Vector3[] = [];
      // create base by transformation of polygon with first transform
      let base: Vector3[] = polygon.map((_v: Vector3) => Vector3.TRANSFORMATION(_v, _transforms[0], true));
      vertices.push(...base);
      // create lid by transformation of polygon with last transform
      let lid: Vector3[] = polygon.map((_v: Vector3) => Vector3.TRANSFORMATION(_v, _transforms[nTransforms - 1], true));
      vertices.push(...lid);

      // duplicate first vertex of polygon to the end to create a texturable wrapping
      polygon.push(polygon[0].copy);
      for (let transform of _transforms) {
        let wrap: Vector3[] = polygon.map((_v: Vector3) => Vector3.TRANSFORMATION(_v, transform, true));
        vertices.push(...wrap);
      }


      // copy indices to new index array
      let indices: number[] = [];
      indices.push(...this.indices);

      // copy indices for second polygon and reverse sequence
      for (let i: number = 0; i < nIndicesPolygon; i += 3) {
        indices.push(this.indices[i] + nVerticesPolygon);
        indices.push(this.indices[i + 2] + nVerticesPolygon);
        indices.push(this.indices[i + 1] + nVerticesPolygon);
      }

      // create indizes for wrapper
      for (let t: number = 0; t < nTransforms - 1; t++)
        for (let i: number = 0; i < nVerticesPolygon; i++) {
          let vertex: number = i + (2 + t) * nVerticesPolygon + t;
          indices.push(vertex);
          indices.push(vertex + nVerticesPolygon + 1);
          indices.push(vertex + nVerticesPolygon + 2);
          indices.push(vertex);
          indices.push(vertex + nVerticesPolygon + 2);
          indices.push(vertex + 1);
        }

      //delete "non"-faces with two identical vectors
      for (let i: number = indices.length - 3; i >= 0; i -= 3) {
        let v0: Vector3 = vertices[indices[i]];
        let v1: Vector3 = vertices[indices[i + 1]];
        let v2: Vector3 = vertices[indices[i + 2]];
        if (v0.equals(v1) || v2.equals(v1) || v0.equals(v2))
          indices.splice(i, 3);
      }


      let nTextureUVs: number = this.textureUVs.length;
      let textureUVs: number[] = [];
      textureUVs.push(...this.textureUVs);
      textureUVs.push(...this.textureUVs);

      // TODO: wrap texture nicer respecting the distances between vertices, see lengths polygon etc.
      // let sumLengths: number = lengthsPolygon.reduce((_sum, _value) => _sum + _value);
      let index: number = nTextureUVs * 2;
      let incV: number = 1 / nVerticesPolygon;
      let incU: number = 1 / (nTransforms - 1);
      let u: number = 1;
      for (let t: number = 0; t < nTransforms - 1; t++) {
        let v: number = 0;
        for (let vertex: number = 0; vertex <= nVerticesPolygon; vertex++) {
          textureUVs[index] = v;
          textureUVs[index + nVerticesPolygon * 2 + 2] = v;
          index++;
          textureUVs[index] = u;
          textureUVs[index + nVerticesPolygon * 2 + 2] = u - incU;
          index++;
          v += incV;
        }
        u -= incU;
      }

      this.ƒvertices = new Float32Array(vertices.map((_v: Vector3) => [_v.x, _v.y, _v.z]).flat());
      this.ƒindices = new Uint16Array(indices);
      this.ƒtextureUVs = new Float32Array(textureUVs);
    }

    // private calculatePolygonLengths(): number[] {
    //   let result: number[] = [];
    //   let first: Vector3;
    //   let prev: Vector3;
    //   for (let i: number = 0; i < this.vertices.length; i += 3) {
    //     let current: Vector3 = new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]);
    //     if (prev)
    //       result.push(Vector3.DIFFERENCE(current, prev).magnitude);
    //     else
    //       first = current;
    //     prev = current;
    //   }
    //   result.push(Vector3.DIFFERENCE(first, prev).magnitude);
    //   return result;
    // }
  }
}