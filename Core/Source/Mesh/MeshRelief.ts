///<reference path="MeshTerrain.ts"/>
namespace FudgeCore {
  /**
   * Generates a planar Grid and applies a Heightmap-Function to it.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Moritz Beaugrand, HFU, 2020
   */
  export class MeshRelief extends MeshTerrain {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshRelief);

    public constructor(_name: string = "MeshRelief", _texture: TextureImage = null) {
      super(_name, _texture ? new Vector2(_texture.image.width, _texture.image.height) : undefined, undefined, MeshRelief.createHeightMapFunction(_texture));
    }

    private static createHeightMapFunction(_texture: TextureImage): HeightMapFunction {
      let array: Uint8ClampedArray = MeshRelief.textureToClampedArray(_texture);
      let heightMapFunction: HeightMapFunction = (_x: number, _z: number) => {
        let pixel: number = _z * _texture.image.width + _x;
        return array[pixel * 4] / 255;
      };
      return heightMapFunction;
    }

    private static textureToClampedArray(_texture: TextureImage): Uint8ClampedArray {
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      canvas.width = _texture.image.width;
      canvas.height = _texture.image.height;

      let crc: CanvasRenderingContext2D = canvas.getContext("2d");
      crc.imageSmoothingEnabled = false;
      crc.drawImage(_texture.image, 0, 0);

      return crc.getImageData(0, 0, _texture.image.width, _texture.image.height).data;
    }

    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array((this.resolution.x + 1) * (this.resolution.y + 1) * 3);
      //Iterate over each cell to generate grid of vertices
      let i: number = 0;
      for (let z: number = 0; z <= this.resolution.y; z++) {
        for (let x: number = 0; x <= this.resolution.x; x++) {
          let xNorm: number = x / this.resolution.x;
          let zNorm: number = z / this.resolution.y;
          vertices[i] = xNorm - 0.5;
          vertices[i + 1] = this.heightMapFunction(x, z);
          vertices[i + 2] = zNorm - 0.5;
          i += 3;
        }
      }
      return vertices;
    }
  }
}