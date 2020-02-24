namespace FudgeCore {
  /**
   * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
   * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshSphere extends Mesh {
    public normals: Float32Array;

    private sectors: number;
    private stacks: number;

    // Dirty Workaround to have access to the normals from createVertices()
    // private normals: Array<number> = [];
    // private textureUVs: Array<number> = [];
    // public textureUVs: Float32Array;

    public constructor(_sectors: number = 12, _stacks: number = 8) {
      super();

      //Clamp resolution to prevent performance issues
      this.sectors = Math.min(_sectors, 128);
      this.stacks = Math.min(_stacks, 128);

      if (_sectors < 3 || _stacks < 2) {
        Debug.warn("UV Sphere must have at least 3 sectors and 2 stacks to form a 3-dimensional shape.");
        this.sectors = Math.max(3, _sectors);
        this.stacks = Math.max(2, _stacks);
      }

      this.create();
    }

    public create(): void {
      let vertices: Array<number> = [];
      let normals: number[] = [];
      let textureUVs: number[] = [];

      let x: number;
      let z: number;
      let xz: number;
      let y: number;


      let sectorStep: number = 2 * Math.PI / this.sectors;
      let stackStep: number = Math.PI / this.stacks;
      let stackAngle: number;
      let sectorAngle: number;

      /* add (sectorCount+1) vertices per stack.
      the first and last vertices have same position and normal, 
      but different tex coords */
      for (let i: number = 0; i <= this.stacks; ++i) {
        stackAngle = Math.PI / 2 - i * stackStep;
        xz = Math.cos(stackAngle);
        y = Math.sin(stackAngle);

        // add (sectorCount+1) vertices per stack
        // the first and last vertices have same position and normal, but different tex coords
        for (let j: number = 0; j <= this.sectors; ++j) {
          sectorAngle = j * sectorStep;

          //vertex position
          x = xz * Math.cos(sectorAngle);
          z = xz * Math.sin(sectorAngle);
          vertices.push(x, y, z);

          //normals
          normals.push(x, y, z);

          //UV Coords
          textureUVs.push(j / this.sectors * -1);
          textureUVs.push(i / this.stacks);
        }
      }

      // scale down
      vertices = vertices.map(_value => _value / 2);

      this.textureUVs = new Float32Array(textureUVs);
      this.normals = new Float32Array(normals);
      this.vertices = new Float32Array(vertices);      
      this.normalsFace = this.createFaceNormals();
      this.indices = this.createIndices();
    }

    protected createIndices(): Uint16Array {
      let inds: Array<number> = [];

      let k1: number;
      let k2: number;

      for (let i: number = 0; i < this.stacks; ++i) {
        k1 = i * (this.sectors + 1);   // beginning of current stack
        k2 = k1 + this.sectors + 1;    // beginning of next stack

        for (let j: number = 0; j < this.sectors; ++j, ++k1, ++k2) {

          // 2 triangles per sector excluding first and last stacks
          // k1 => k2 => k1+1
          if (i != 0) {
            inds.push(k1);
            inds.push(k1 + 1);
            inds.push(k2);
          }

          if (i != (this.stacks - 1)) {
            inds.push(k1 + 1);
            inds.push(k2 + 1);
            inds.push(k2);
          }
        }
      }
      let indices: Uint16Array = new Uint16Array(inds);
      return indices;
    }

    protected createVertices(): Float32Array {
      return this.vertices;
    }

    protected createTextureUVs(): Float32Array {
      return this.textureUVs;
    }

    //TODO: we also need REAL face normals
    protected createFaceNormals(): Float32Array {
      return this.normals;
    }
  }
}