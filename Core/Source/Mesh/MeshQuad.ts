namespace FudgeCore {
  /**
   * Generate a simple quad with edges of length 1, the face consisting of two trigons
   * ```plaintext
   *        0 __ 3
   *         |__|
   *        1    2             
   * ``` 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class MeshQuad extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshQuad);

    public constructor(_name: string = "MeshQuad") {
      super(_name);
      // this.create();
      let vertices: Vertex[] = [
        new Vertex(new Vector3(-1, 1, 0), new Vector2(0, 0)),
        new Vertex(new Vector3(-1, -1, 0), new Vector2(0, 1)),
        new Vertex(new Vector3(1, -1, 0), new Vector2(1, 1)),
        new Vertex(new Vector3(1, 1, 0), new Vector2(1, 0))
      ];
      let faces: Face[] = [
        new Face(vertices, 1, 2, 0),
        new Face(vertices, 2, 3, 0)
      ];

      this.ƒvertices = new Float32Array(vertices.flatMap((_vertex: Vertex) => [..._vertex.position.get()]));
      this.ƒtextureUVs = new Float32Array(vertices.flatMap((_vertex: Vertex) => [..._vertex.uv.get()]));
      this.ƒindices = new Uint16Array(faces.flatMap((_face: Face) => [..._face.indices]));
      this.ƒnormalsFlat = new Float32Array(this.ƒvertices.length);
      for (let face of faces) {
        let index: number = 3 * face.indices[2]; // face normal gets attached to the third vertex
        this.ƒnormalsFlat.set(face.normal.get(), index);
      }

      let normalsVertex: Vector3[] = (new Array<Vector3>(vertices.length)).fill(Vector3.ZERO());
      for (let face of faces)
        for (let index of face.indices)
          normalsVertex[index] = Vector3.SUM(normalsVertex[index], face.normalUnscaled);
      for (let normal of normalsVertex)
        normal.normalize();

      console.log(normalsVertex);

      this.ƒnormalsVertex = new Float32Array(normalsVertex.flatMap((_normal: Vector3) => [..._normal.get()]));
      console.log(this.ƒnormalsVertex);
    }


    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array([
                /*0*/ -1, 1, 0, /*1*/ -1, -1, 0,  /*2*/ 1, -1, 0, /*3*/ 1, 1, 0
      ]);

      vertices = vertices.map(_value => _value / 2);
      return vertices;
    }

    protected createIndices(): Uint16Array {
      let indices: Uint16Array = new Uint16Array([
        1, 2, 0, 2, 3, 0
      ]);
      return indices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0
      ]);
      return textureUVs;
    }

    protected createFlatNormals(): Float32Array {
      return new Float32Array([
                /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 0, 0, 0
      ]);
    }
  }
}