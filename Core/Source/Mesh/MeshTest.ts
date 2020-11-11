namespace FudgeCore {
  export class MeshTest extends Mesh {

    constructor(_name: string = "MeshTest") {
      super(_name);
      this.create();
    }

    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array([
        // front
        /*0*/ -1, 1, 1, /*1*/ -1, -1, 1,  /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
        // back
        /*4*/ -1, 1, -1, /*5*/ -1, -1, -1, /*6*/ 1, -1, -1, /*7*/ 1, 1, -1,
        // right / left
        /*0,8*/ -1, 1, 1, /*1,9*/ -1, -1, 1, /*2,10*/ 1, -1, 1, /*3,11*/ 1, 1, 1,
        /*4,12*/ -1, 1, -1, /*5,13*/ -1, -1, -1, /*6,14*/ 1, -1, -1, /*7,15*/ 1, 1, -1,
        // bottom / top
        /*0,16*/ -1, 1, 1, /*1,17*/ -1, -1, 1, /*2,18*/ 1, -1, 1, /*3,19*/ 1, 1, 1,
        /*4,20*/ -1, 1, -1, /*5,21*/ -1, -1, -1, /*6,22*/ 1, -1, -1, /*7,23*/ 1, 1, -1
      ]);

      // scale down to a length of 1 for all edges
      vertices = vertices.map(_value => _value / 2);

      return vertices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array([
        // front
        /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0,
        // back
        /*4*/ 3, 0, /*5*/ 3, 1,  /*6*/ 2, 1, /*7*/ 2, 0,

        // right / left
        /*0,8*/ 0, 0, /*1,9*/ 0, 1, /*2,10*/ 1, 1, /*3,11*/ 1, 0,
        /*4,12*/ -1, 0, /*5,13*/ -1, 1, /*6,14*/ 2, 1, /*7,15*/ 2, 0,

        // bottom / top
        /*0,16*/ 1, 0, /*1,17*/ 1, 1, /*2,18*/ 1, 2,  /*3,19*/ 1, -1,  
        /*4,20*/ 0, 0, /*5,21*/ 0, 1, /*6,22*/ 0, 2, /*7,23*/ 0, -1
      ]);
      return textureUVs;
    }

    protected createIndices(): Uint16Array {
      let indices: Uint16Array = new Uint16Array([
        // front
        1, 2, 0, 2, 3, 0,
        // back
        6, 5, 7, 5, 4, 7,
        // right
        2 + 8, 6 + 8, 3 + 8, 6 + 8, 7 + 8, 3 + 8,
        // left
        5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
        // bottom 
        5 + 16, 6 + 16, 1 + 16, 6 + 16, 2 + 16, 1 + 16,
        // top
        4 + 16, 0 + 16, 3 + 16, 7 + 16, 4 + 16, 3 + 16
      ]);

      return indices;
    }

    protected createFaceNormals(): Float32Array {
      let normals: Float32Array = new Float32Array([
        // front
        /*0*/ 0, 0, 1, /*1*/ 0, 0, 1, /*2*/ 0, 0, 1, /*3*/ 0, 0, 1,
        // back
        /*4*/ 0, 0, -1, /*5*/ 0, 0, -1, /*6*/ 0, 0, -1, /*7*/ 0, 0, -1,
        // right
        /*8*/ 1, 0, 0, /*9*/ 1, 0, 0, /*10*/ 1, 0, 0, /*11*/ 1, 0, 0,
        // left
        /*12*/ -1, 0, 0, /*13*/ -1, 0, 0, /*14*/ -1, 0, 0, /*15*/ -1, 0, 0,
        // bottom
        /*16*/ 0, -1, 0, /*17*/ 0, -1, 0, /*18*/ 0, -1, 0, /*19*/ 0, -1, 0,
        // top 
        /*20*/ 0, 1, 0, /*21*/ 0, 1, 0, /*22*/ 0, 1, 0, /*23*/ 0, 1, 0
      ]);
      return normals;
    }
    
  }
}