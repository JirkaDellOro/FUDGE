namespace FudgeCore {
  /**
   * Generates a prism which is a simple extrusion of a polygon
   * ```plaintext
   *             _______ 
   * Polygon  → ╱ ╲_____╲ ← Polygon
   *            ╲_╱_____╱
   *            Z-Length 1
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MeshPrism extends MeshPolygon {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshPrism);

    public constructor(_name: string = "MeshPrism", _vertices: Vector2[] = MeshPolygon.verticesDefault, _fitMesh: boolean = true, _fitTexture: boolean = true) {
      super(_name, _vertices, _fitMesh, _fitTexture);
      this.extrude();
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
      this.extrude();
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion


    private extrude(): void {
      let lengthVertexArrayPolygon: number = this.vertices.length;
      let nVerticesPolygon: number = lengthVertexArrayPolygon / 3;
      let nVerticesPrism: number = 4 * nVerticesPolygon + 2; // second polygon + wrapper + closing points
      let lengthVertexArrayPrism: number = nVerticesPrism * 3;

      let nIndicesPolygon: number = this.indices.length;
      let nFacesPolygon: number = nIndicesPolygon / 3;
      let nFacesPrism: number = nFacesPolygon * 2 + nVerticesPolygon * 2;
      let nIndicesPrism: number = nFacesPrism * 3;

      let vertices: Float32Array = new Float32Array(lengthVertexArrayPrism);
      // move polygon to z = 0.5
      for (let i: number = 0; i < nVerticesPolygon; i++)
        this.vertices[2 + i * 3] = 0.5;
      // copy to new vertex array
      vertices.set(this.vertices, 0);

      // move polygon to z = -0.5
      for (let i: number = 0; i < nVerticesPolygon; i++)
        this.vertices[2 + i * 3] = -0.5;
      // copy to new vertex array
      vertices.set(this.vertices, lengthVertexArrayPolygon);

      // duplicate vertices of first polygon for wrapping
      vertices.set(vertices.slice(0, lengthVertexArrayPolygon), lengthVertexArrayPolygon * 2);
      // duplicate first vertex of first polygon again to close wrapper
      vertices.set(vertices.slice(0, 3), lengthVertexArrayPolygon * 3);
      // duplicate vertices of second polygon for wrapping
      vertices.set(vertices.slice(lengthVertexArrayPolygon, lengthVertexArrayPolygon * 2), lengthVertexArrayPolygon * 3 + 3);
      // duplicate first vertex of second polygon again to close wrapper
      vertices.set(vertices.slice(lengthVertexArrayPolygon, lengthVertexArrayPolygon + 3), lengthVertexArrayPrism - 3);

      this.ƒvertices = vertices;

      // copy indices to new index array
      let indices: Uint16Array = new Uint16Array(nIndicesPrism);
      indices.set(this.indices, 0);

      // copy indices for second polygon and reverse sequence
      for (let i: number = 0; i < nIndicesPolygon; i += 3) {
        indices[nIndicesPolygon + i] = this.indices[i] + nVerticesPolygon;
        indices[nIndicesPolygon + i + 1] = this.indices[i + 2] + nVerticesPolygon;
        indices[nIndicesPolygon + i + 2] = this.indices[i + 1] + nVerticesPolygon;
      }

      // create indizes for wrapper
      let index: number = nIndicesPolygon * 2;
      for (let i: number = 0; i < nVerticesPolygon; i++) {
        let vertex: number = i + 2 * nVerticesPolygon;
        indices[index++] = vertex;
        indices[index++] = vertex + nVerticesPolygon + 1;
        indices[index++] = vertex + nVerticesPolygon + 2;
        indices[index++] = vertex;
        indices[index++] = vertex + nVerticesPolygon + 2;
        indices[index++] = vertex + 1;
      }
      this.ƒindices = indices;

      let nTextureUVs: number = this.textureUVs.length;
      let textureUVs: Float32Array = new Float32Array(nVerticesPrism * 2);
      textureUVs.set(this.textureUVs, 0);
      textureUVs.set(this.textureUVs, nTextureUVs);

      let increment: number = 1 / nVerticesPolygon;
      index = nTextureUVs * 2;
      let v: number = 0;
      for (let vertex: number = 0; vertex <= nVerticesPolygon; vertex++) {
        textureUVs[index] = v;
        textureUVs[index + nVerticesPolygon * 2 + 2] = v;
        index++;
        textureUVs[index] = 0;
        textureUVs[index + nVerticesPolygon * 2 + 2] = 1;
        index++;
        v += increment;
      }

      this.ƒtextureUVs = textureUVs;
    }
  }
}