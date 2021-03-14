namespace FudgeCore {

  /** This function type takes x and z as Parameters and returns a number - to be used as a heightmap. 
   * x and z are mapped from 0 to 1 when used to generate a Heightmap Mesh
   * @authors Simon Storl-Schulke, HFU, 2020*/
  export type heightMapFunction = (x: number, z: number) => number;

  /**
   * Generates a planar Grid and applies a Heightmap-Function to it.
   * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, HFU, 2020
   */
  export class MeshHeightMap extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshHeightMap);

    private resolutionX: number;
    private resolutionZ: number;
    private heightMapFunction: heightMapFunction;

    public constructor(_name: string = "MeshHeightMap", _resolutionX: number = 16, _resolutionZ: number = 16, _heightMapFunction?: heightMapFunction) {
      super(_name);
      this.resolutionX = _resolutionX;
      this.resolutionZ = _resolutionZ;

      if (_resolutionZ || _resolutionX <= 0) {
        Debug.warn("HeightMap Mesh cannot have resolution values < 1. ");
        this.resolutionX = Math.max(1, this.resolutionX);
        this.resolutionZ = Math.max(1, this.resolutionZ);
      }

      if (_heightMapFunction) this.heightMapFunction = _heightMapFunction;
      else this.heightMapFunction = function (_x: number, _y: number): number { return 0; };

      // this.create();
    }

    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array((this.resolutionX + 1) * (this.resolutionZ + 1) * 3);

      //Iterate over each cell to generate grid of vertices
      for (let i: number = 0, z: number = 0; z <= this.resolutionZ; z++) {
        for (let x: number = 0; x <= this.resolutionX; x++) {
          // X
          vertices[i] = x / this.resolutionX - 0.5;
          // Apply heightmap to y coordinate
          vertices[i + 1] = this.heightMapFunction(x / this.resolutionX, z / this.resolutionZ);
          // Z
          vertices[i + 2] = z / this.resolutionZ - 0.5;
          i += 3;
        }
      }
      return vertices;
    }

    protected createIndices(): Uint16Array {
      let vert: number = 0;
      let tris: number = 0;

      let indices: Uint16Array = new Uint16Array(this.resolutionX * this.resolutionZ * 6);
      for (let z: number = 0; z < this.resolutionZ; z++) {
        for (let x: number = 0; x < this.resolutionX; x++) {

          // First triangle of each grid-cell
          indices[tris + 0] = vert + 0;
          indices[tris + 1] = vert + this.resolutionX + 1;
          indices[tris + 2] = vert + 1;

          // Second triangle of each grid-cell
          indices[tris + 3] = vert + 1;
          indices[tris + 4] = vert + this.resolutionX + 1;
          indices[tris + 5] = vert + this.resolutionX + 2;
          vert++;
          tris += 6;
        }
        vert++;
      }
      return indices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array(this.indices.length * 2);

      for (let i: number = 0, z: number = 0; z <= this.resolutionZ; z++) {
        for (let x: number = 0; x <= this.resolutionX; x++) {
          textureUVs[i] = x / this.resolutionX;
          textureUVs[i + 1] = z / this.resolutionZ;
          i += 2;
        }
      }
      return textureUVs;
    }
  }
}