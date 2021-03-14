namespace FudgeCore {
  /**
   * Generate a simple pyramid with edges at the base of length 1 and a height of 1. The sides consisting of one, the base of two trigons
   * ```plaintext
   *               4
   *              /\`.
   *            3/__\_\ 2
   *           0/____\/1
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class MeshPyramid extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshPyramid);

    public constructor(_name: string = "MeshPyramid") {
      super(_name);
      // this.create();
    }


    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array([
                // floor
                /*0*/ -1, 0, 1, /*1*/ 1, 0, 1,  /*2*/ 1, 0, -1, /*3*/ -1, 0, -1,
                // tip
                /*4*/ 0, 2, 0,  // double height will be scaled down
                // floor again for texturing and normals
                /*5*/ -1, 0, 1, /*6*/ 1, 0, 1,  /*7*/ 1, 0, -1, /*8*/ -1, 0, -1
      ]);

      // scale down to a length of 1 for bottom edges and height
      vertices = vertices.map(_value => _value / 2);
      return vertices;
    }

    protected createIndices(): Uint16Array {
      let indices: Uint16Array = new Uint16Array([
        // front
        4, 0, 1,
        // right
        4, 1, 2,
        // back
        4, 2, 3,
        // left
        4, 3, 0,
        // bottom
        5 + 0, 5 + 2, 5 + 1, 5 + 0, 5 + 3, 5 + 2
      ]);
      return indices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array([
                // front
                /*0*/ 0, 1, /*1*/ 1, 1,  /*2*/ 1, 0, /*3*/ 0, 0,
                // back
                /*4*/ 0.5, 0.5,
                /*5*/ 0, 0, /*6*/ 1, 0,  /*7*/ 1, 1, /*8*/ 0, 1
      ]);
      return textureUVs;
    }
  }
}