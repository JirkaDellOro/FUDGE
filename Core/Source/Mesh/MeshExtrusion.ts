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
    #transforms: Matrix4x4[] = [];

    public constructor(_name: string = "MeshExtrusion", _vertices: Vector2[] = MeshPolygon.verticesDefault, _transforms: Matrix4x4[] = MeshExtrusion.transformsDefault, _fitMesh: boolean = true, _fitTexture: boolean = true) {
      super(_name, _vertices, _fitMesh, _fitTexture);
      this.extrude(_transforms);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.construction = Serializer.serializeArray(Vector2, this.construction);
      serialization.fitMesh = this.fitMesh;
      serialization.fitTexture = this.fitTexture;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      // console.log(_serialization.transforms);
      let transforms: Matrix4x4[] = <Matrix4x4[]>await Serializer.deserializeArray(_serialization.transforms);
      // console.log(transforms[0].toString(), transforms[1].toString());
      this.extrude(transforms);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion


    private extrude(_transforms: Matrix4x4[] = MeshExtrusion.transformsDefault): void {
      this.#transforms = _transforms;
      let polygon: Vector3[] = [];
      for (let i: number = 0; i < this.vertices.length; i += 3)
        polygon.push(new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));

      let nTransforms: number = _transforms.length;
      let lengthVertexArrayPolygon: number = this.vertices.length;
      let nVerticesPolygon: number = polygon.length;
      let nVerticesExtrusion: number = 2 * nVerticesPolygon + (nVerticesPolygon + 1) * nTransforms; // base + lid + wrapper + closing points
      let lengthVertexArrayExtrusion: number = nVerticesExtrusion * 3;

      let nFacesPolygon: number = nVerticesPolygon - 2;
      let nIndicesPolygon: number = nFacesPolygon * 3;
      let nFacesExtrusion: number = nFacesPolygon * 2 + nVerticesPolygon * 2 * (nTransforms - 1);
      let nIndicesExtrusion: number = nFacesExtrusion * 3;

      let vertices: Float32Array = new Float32Array(lengthVertexArrayExtrusion);
      
      // create base by transformation of polygon with first transform
      let base: Vector3[] = polygon.map((_v: Vector3) => Vector3.TRANSFORMATION(_v, _transforms[0], true));
      vertices.set(base.map((_v: Vector3) => [_v.x, _v.y, _v.z]).flat());
      // create lid by transformation of polygon with last transform
      let lid: Vector3[] = polygon.map((_v: Vector3) => Vector3.TRANSFORMATION(_v, _transforms[nTransforms - 1], true));
      vertices.set(lid.map((_v: Vector3) => [_v.x, _v.y, _v.z]).flat(), lengthVertexArrayPolygon);
      
      // duplicate first vertex of polygon to the end to create a texturable wrapping
      polygon.push(polygon[0].copy);
      let index: number = lengthVertexArrayPolygon * 2;
      for (let transform of _transforms) {
        let wrap: Vector3[] = polygon.map((_v: Vector3) => Vector3.TRANSFORMATION(_v, transform, true));
        vertices.set(wrap.map((_v: Vector3) => [_v.x, _v.y, _v.z]).flat(), index);
        index += polygon.length * 3;
      }
      
      this.ƒvertices = vertices;

      // copy indices to new index array
      let indices: Uint16Array = new Uint16Array(nIndicesExtrusion);
      indices.set(this.indices, 0);

      // copy indices for second polygon and reverse sequence
      for (let i: number = 0; i < nIndicesPolygon; i += 3) {
        indices[nIndicesPolygon + i] = this.indices[i] + nVerticesPolygon;
        indices[nIndicesPolygon + i + 1] = this.indices[i + 2] + nVerticesPolygon;
        indices[nIndicesPolygon + i + 2] = this.indices[i + 1] + nVerticesPolygon;
      }

      // create indizes for wrapper
      index = nIndicesPolygon * 2;
      for (let t: number = 0; t < nTransforms - 1; t++)
        for (let i: number = 0; i < nVerticesPolygon; i++) {
          let vertex: number = i + (2 + t) * nVerticesPolygon + t;
          indices[index++] = vertex;
          indices[index++] = vertex + nVerticesPolygon + 1;
          indices[index++] = vertex + nVerticesPolygon + 2;
          indices[index++] = vertex;
          indices[index++] = vertex + nVerticesPolygon + 2;
          indices[index++] = vertex + 1;
        }
      this.ƒindices = indices;

      let nTextureUVs: number = this.textureUVs.length;
      let textureUVs: Float32Array = new Float32Array(nVerticesExtrusion * 2);
      textureUVs.set(this.textureUVs, 0);
      textureUVs.set(this.textureUVs, nTextureUVs);

      // TODO: wrap texture nicer respecting the distances between vertices, see lengths polygon etc.
      // let sumLengths: number = lengthsPolygon.reduce((_sum, _value) => _sum + _value);
      let incV: number = 1 / nVerticesPolygon;
      let incU: number = 1 / (nTransforms - 1);
      index = nTextureUVs * 2;
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

      this.ƒtextureUVs = textureUVs;
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