namespace FudgeCore {
  /**
   * Generate a Torus with a given thickness and the number of major- and minor segments
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshTorus extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshTorus);
    private thickness: number = 0.25;
    private majorSegments: number = 32;
    private minorSegments: number = 12;

    public constructor(_name: string = "MeshTorus", _thickness: number = 0.25, _majorSegments: number = 32, _minorSegments: number = 12) {
      super(_name);
      this.create(_thickness, _majorSegments, _minorSegments);
    }

    public create(_thickness: number = 0.25, _majorSegments: number = 32, _minorSegments: number = 12): void {
      //Clamp resolution to prevent performance issues
      this.majorSegments = Math.min(_majorSegments, 128);
      this.minorSegments = Math.min(_minorSegments, 128);

      if (_majorSegments < 3 || _minorSegments < 3) {
        Debug.warn("Torus must have at least 3 major and minor segments");
        this.majorSegments = Math.max(3, _majorSegments);
        this.minorSegments = Math.max(3, _minorSegments);
      }

      this.clear();

      let vertices: Array<number> = [];
      let normals: number[] = [];
      let textureUVs: number[] = [];

      let centerX: number;
      let centerY: number;


      let x: number, y: number, z: number;
      let PI2: number = Math.PI * 2;
      for (let j: number = 0; j <= this.minorSegments; j++) {
        for (let i: number = 0; i <= this.majorSegments; i++) {
          let u: number = i / this.majorSegments * PI2;
          let v: number = j / this.minorSegments * PI2;

          centerX = Math.cos(u);
          centerY = Math.sin(u);

          x = (1 + this.thickness * Math.cos(v)) * Math.sin(u);
          y = this.thickness * Math.sin(v);
          z = (1 + this.thickness * Math.cos(v)) * Math.cos(u);

          vertices.push(x, y, z);

          let normal: Vector3 = new Vector3(x - centerX, y - centerY, z);
          normal.normalize();
          normals.push(normal.x, normal.y, normal.z);

          textureUVs.push(i / this.majorSegments, j / this.minorSegments);
        }
      }

      // scale down
      vertices = vertices.map(_value => _value / 2);

      this.ƒtextureUVs = new Float32Array(textureUVs);
      this.ƒnormals = new Float32Array(normals);
      this.ƒvertices = new Float32Array(vertices);
      this.ƒindices = this.createIndices();
      this.createRenderBuffers();
    }


    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      let thickness: number = Math.round(_mutator.thickness);
      let majorSegments: number = Math.round(_mutator.majorSegments);
      let minorSegments: number = Math.round(_mutator.minorSegments);
      this.create(thickness, majorSegments, minorSegments);
    }

    protected createIndices(): Uint16Array {
      let inds: Array<number> = [];

      for (let j: number = 1; j <= this.minorSegments; j++) {
        for (let i: number = 1; i <= this.majorSegments; i++) {
          let a: number = (this.majorSegments + 1) * j + i - 1;
          let b: number = (this.majorSegments + 1) * (j - 1) + i - 1;
          let c: number = (this.majorSegments + 1) * (j - 1) + i;
          let d: number = (this.majorSegments + 1) * j + i;

          inds.push(a, b, d, b, c, d);
        }
      }
      let indices: Uint16Array = new Uint16Array(inds);
      return indices;
    }
  }
}