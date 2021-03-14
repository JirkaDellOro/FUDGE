namespace FudgeCore {
  /**
   * Generate a simple cube with edges of length 1, each face consisting of two trigons
   * ```plaintext
   *            4____7
   *           0/__3/|
   *            ||5_||6
   *           1|/_2|/ 
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class MeshCube extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCube);
   
    public constructor(_name: string = "MeshCube") {
      super(_name);
      // this.create();
    }


    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array([
                // First wrap
                // front
                /*0*/ -1, 1, 1, /*1*/ -1, -1, 1,  /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
                // back
                /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1,  /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1,
                // Second wrap
                // front
                /*0*/ -1, 1, 1, /*1*/ -1, -1, 1,  /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
                // back
                /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1,  /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1
      ]);

      // scale down to a length of 1 for all edges
      vertices = vertices.map(_value => _value / 2);

      return vertices;
    }

    protected createIndices(): Uint16Array {
      let indices: Uint16Array = new Uint16Array([
        // First wrap
        // front
        1, 2, 0, 2, 3, 0,
        // right
        2, 6, 3, 6, 7, 3,
        // back
        6, 5, 7, 5, 4, 7,

        // Second wrap
        // left
        5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
        // top
        4 + 8, 0 + 8, 3 + 8, 7 + 8, 4 + 8, 3 + 8,
        // bottom
        5 + 8, 6 + 8, 1 + 8, 6 + 8, 2 + 8, 1 + 8

        /*,
        // left
        4, 5, 1, 4, 1, 0,
        // top
        4, 0, 3, 4, 3, 7,
        // bottom
        1, 5, 6, 1, 6, 2
        */
      ]);
      return indices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array([
                // First wrap
                // front
                /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0,
                // back
                /*4*/ 3, 0, /*5*/ 3, 1,  /*6*/ 2, 1, /*7*/ 2, 0,

                // Second wrap
                // front
                /*0*/ 1, 0, /*1*/ 1, 1,  /*2*/ 1, 2, /*3*/ 1, -1,
                // back
                /*4*/ 0, 0, /*5*/ 0, 1,  /*6*/ 0, 2, /*7*/ 0, -1
      ]);
      return textureUVs;
    }

    protected createFaceNormals(): Float32Array {
      let normals: Float32Array = new Float32Array([
                // for each triangle, the last vertex of the three defining refers to the normalvector when using flat shading
                // First wrap
                // front
                /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 1, 0, 0,
                // back
                /*4*/ 0, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, -1,

                // Second wrap
                // front
                /*0*/ 0, 0, 0, /*1*/ 0, -1, 0, /*2*/ 0, 0, 0, /*3*/ 0, 1, 0,
                // back
                /*4*/ -1, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, 0
      ]);

      //normals = this.createVertices();

      return normals;
    }
  }
}