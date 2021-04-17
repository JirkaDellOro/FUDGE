namespace FudgeCore {

  /** This function type takes x and z as Parameters and returns a number - to be used as a heightmap. 
   * x and z are mapped from 0 to 1 when used to generate a Heightmap Mesh
   * @authors Simon Storl-Schulke, HFU, 2020*/
  // export type heightMapFunction = (x: number, z: number) => number;

  /**
   * Generates a planar Grid and applies a Heightmap-Function to it.
   * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, HFU, 2020
   */
  export class MeshHeightMap extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshHeightMap);

    public resolutionX: number;
    public resolutionZ: number;
    private heightMapFunction: HeightMapFunction;
    private image: TextureImage;
    public imgScale: number = 800;

    public constructor(_name: string = "MeshHeightMap", source?: HeightMapFunction | TextureImage, _resolutionX: number = 16, _resolutionZ: number = 16) {
      super(_name);
      this.resolutionX = _resolutionX;
      this.resolutionZ = _resolutionZ;

      if (_resolutionZ || _resolutionX <= 0) {
        Debug.warn("HeightMap Mesh cannot have resolution values < 1. ");
        this.resolutionX = Math.max(1, this.resolutionX);
        this.resolutionZ = Math.max(1, this.resolutionZ);
      }

      if (!(source instanceof TextureImage)) {
        this.heightMapFunction = source;
        this.image = null;
      }
      else this.heightMapFunction = null;

      if (source instanceof TextureImage) {
        this.image = source;
        this.resolutionX = source.image.width - 1;
        this.resolutionZ = source.image.height - 1;
      }
      else this.image = null;

      // this.create();
    }



    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array((this.resolutionX + 1) * (this.resolutionZ + 1) * 3);

      if (this.heightMapFunction != null) {
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
      else if (this.image != null) {
        let imgArray = this.imageToClampedArray(this.image);
        // console.log(imgArray);
        let px = 0;

        for (let i: number = 0, z: number = 0; z <= this.resolutionZ; z++) {
          for (let x: number = 0; x <= this.resolutionX; x++) {
            // X
            vertices[i] = x / this.resolutionX - 0.5;
            // Apply heightmap to y coordinate
            vertices[i + 1] = imgArray[px * 4] / this.imgScale;
            // Z
            vertices[i + 2] = z / this.resolutionZ - 0.5;
            i += 3;
            px++;
          }
        }
        // console.log("resx: " + this.resolutionX + " resz: " + this.resolutionZ);

        return vertices;

      }
      else {
        throw new Error("No Source for Vertices is given, must be function or image");
      }
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

    protected createFaceNormals(): Float32Array {
      return this.calculateFaceNormals();
    }

    protected imageToClampedArray(image: TextureImage): Uint8ClampedArray {
      let trImport: Uint8ClampedArray;

      let canvasImage: HTMLCanvasElement = document.createElement("canvas");
      canvasImage.width = image.image.width;
      canvasImage.height = image.image.height;

      let crcTransition: CanvasRenderingContext2D = canvasImage.getContext("2d");
      crcTransition.imageSmoothingEnabled = false;
      crcTransition.drawImage(image.image, 0, 0);

      trImport = crcTransition.getImageData(0, 0, image.image.width, image.image.height).data;

      return trImport;
    }
  }
}