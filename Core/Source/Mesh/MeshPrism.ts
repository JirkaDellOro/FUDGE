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

      // double vertices for wrapping
      vertices.set(vertices.slice(0, lengthVertexArrayPolygon * 2), lengthVertexArrayPolygon * 2);
      // copy first and last vertex to close wrapper
      vertices.set(vertices.slice(lengthVertexArrayPolygon, lengthVertexArrayPolygon + 3), lengthVertexArrayPrism - 6);
      vertices.set(vertices.slice(0, 3), lengthVertexArrayPrism - 3);

      this.ƒvertices = vertices;

      // copy to new index array
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
        indices[index++] = vertex + nVerticesPolygon;
        indices[index++] = vertex + nVerticesPolygon + 1;
        indices[index++] = vertex;
        indices[index++] = vertex + nVerticesPolygon + 1;
        indices[index++] = vertex + 1;
      }
      // close wrapper
      indices[indices.length - 1] = (vertices.length - 1) / 3;

      this.ƒindices = indices;

      let nTextureUVs: number = this.textureUVs.length;
      let textureUVs: Float32Array = new Float32Array(nTextureUVs * 2);
      textureUVs.set(this.textureUVs, 0);
      textureUVs.set(this.textureUVs, nTextureUVs);
      this.ƒtextureUVs = textureUVs;
    }

    // protected createIndices(): Uint16Array {
    //   let indices: Array<number> = [];
    //   for (let i: number = 2; i < this.vertices.length / 3; i++)
    //     indices.push(0, i - 1, i);
    //   return new Uint16Array(indices);
    // }
  }
}