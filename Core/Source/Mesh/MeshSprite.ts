namespace FudgeCore {
  /**
   * Generate two quads placed back to back, the one facing in negative Z-direction is textured reversed
   * ```plaintext
   *        0 __ 3
   *         |__|
   *        1    2             
   * ``` 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshSprite extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshSprite);

    public constructor(_name: string = "MeshSprite") {
      super(_name);
      // this.create();
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
        1, 2, 0, 2, 3, 0, //front
        0, 3, 1, 3, 2, 1  //back
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

    protected createFaceNormals(): Float32Array {
      return new Float32Array([
        /*0: normal of front face*/
        0, 0, 1,
        /*1: normal of back face*/
        0, 0, -1,
        /*2*/
        0, 0, 0,
        /*3*/
        0, 0, 0
      ]);
    }
  }
}