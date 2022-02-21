namespace FudgeCore {
  /**
   * Generate a simple cube with edges of length 1, each face consisting of two trigons
   * ```plaintext
   *       (12) 4____7  (11)
   *       (8) 0/__3/| (10)
   *       (15) ||5_||6 (14)
   *       (9) 1|/_2|/ (13)
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class MeshCube extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCube);

    public constructor(_name: string = "MeshCube") {
      super(_name);
      // this.create();
      this.cloud = new Vertices(
        // front
        new Vertex(new Vector3(-0.5, 0.5, 0.5), new Vector2(0, 0)), // 0
        new Vertex(new Vector3(-0.5, -0.5, 0.5), new Vector2(0, 1)), // 1
        new Vertex(new Vector3(0.5, -0.5, 0.5), new Vector2(1, 1)), // 2
        new Vertex(new Vector3(0.5, 0.5, 0.5), new Vector2(1, 0)), // 3
        // back
        new Vertex(new Vector3(-0.5, 0.5, -0.5), new Vector2(3, 0)), // 4
        new Vertex(new Vector3(-0.5, -0.5, -0.5), new Vector2(3, 1)), // 5
        new Vertex(new Vector3(0.5, -0.5, -0.5), new Vector2(2, 1)), // 6
        new Vertex(new Vector3(0.5, 0.5, -0.5), new Vector2(2, 0)), // 7
        // references
        new Vertex(0, new Vector2(4, 0)), // 8
        new Vertex(1, new Vector2(4, 1)), // 9
        new Vertex(3, new Vector2(0, 1)), // 10
        new Vertex(7, new Vector2(1, 1)), // 11
        new Vertex(4, new Vector2(1, 0)), // 12
        new Vertex(2, new Vector2(0, 0)), // 13
        new Vertex(6, new Vector2(1, 0)), // 14
        new Vertex(5, new Vector2(1, 1)), // 15
      );

      this.faces = [
        ...new Quad(this.cloud, 0, 1, 2, 3).faces, // front
        ...new Quad(this.cloud, 7, 6, 5, 4).faces, // back
        ...new Quad(this.cloud, 3, 2, 6, 7).faces, // right
        ...new Quad(this.cloud, 4, 5, 9, 8).faces, // left
        ...new Quad(this.cloud, 0, 10, 11, 12).faces, // top
        ...new Quad(this.cloud, 13, 1, 15, 14).faces, // bottom
      ];
    }


    // protected createVertices(): Float32Array {
    //   let vertices: Float32Array = new Float32Array([
    //             // First wrap
    //             // front
    //             /*0*/ -1, 1, 1, /*1*/ -1, -1, 1,  /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
    //             // back
    //             /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1,  /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1,
    //             // Second wrap
    //             // front
    //             /*0*/ -1, 1, 1, /*1*/ -1, -1, 1,  /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
    //             // back
    //             /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1,  /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1
    //   ]);

    //   // scale down to a length of 1 for all edges
    //   vertices = vertices.map(_value => _value / 2);

    //   return vertices;
    // }

    // protected createIndices(): Uint16Array {
    //   let indices: Uint16Array = new Uint16Array([
    //     // First wrap
    //     // front
    //     1, 2, 0, 2, 3, 0,
    //     // right
    //     2, 6, 3, 6, 7, 3,
    //     // back
    //     6, 5, 7, 5, 4, 7,

    //     // Second wrap
    //     // left
    //     5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
    //     // top
    //     4 + 8, 0 + 8, 3 + 8, 7 + 8, 4 + 8, 3 + 8,
    //     // bottom
    //     5 + 8, 6 + 8, 1 + 8, 6 + 8, 2 + 8, 1 + 8

    //     /*,
    //     // left
    //     4, 5, 1, 4, 1, 0,
    //     // top
    //     4, 0, 3, 4, 3, 7,
    //     // bottom
    //     1, 5, 6, 1, 6, 2
    //     */
    //   ]);
    //   return indices;
    // }

    // protected createTextureUVs(): Float32Array {
    //   let textureUVs: Float32Array = new Float32Array([
    //             // First wrap
    //             // front
    //             /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0,
    //             // back
    //             /*4*/ 3, 0, /*5*/ 3, 1,  /*6*/ 2, 1, /*7*/ 2, 0,

    //             // Second wrap
    //             // front
    //             /*0*/ 1, 0, /*1*/ 1, 1,  /*2*/ 1, 2, /*3*/ 1, -1,
    //             // back
    //             /*4*/ 0, 0, /*5*/ 0, 1,  /*6*/ 0, 2, /*7*/ 0, -1
    //   ]);
    //   return textureUVs;
    // }

    // protected createFlatNormals(): Float32Array {
    //   let normals: Float32Array = new Float32Array([
    //             // for each triangle, the last vertex of the three defining refers to the normalvector when using flat shading
    //             // First wrap
    //             // front
    //             /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 1, 0, 0,
    //             // back
    //             /*4*/ 0, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, -1,

    //             // Second wrap
    //             // front
    //             /*0*/ 0, 0, 0, /*1*/ 0, -1, 0, /*2*/ 0, 0, 0, /*3*/ 0, 1, 0,
    //             // back
    //             /*4*/ -1, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, 0
    //   ]);

    //   //normals = this.createVertices();

    //   return normals;
    // }
  }
}