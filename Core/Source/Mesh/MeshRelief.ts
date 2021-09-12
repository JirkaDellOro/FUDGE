///<reference path="MeshTerrain.ts"/>
namespace FudgeCore {
  /**
   * Generates a planar Grid and applies a Heightmap-Function to it.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Moritz Beaugrand, HFU, 2020
   */
  export class MeshRelief extends MeshTerrain {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshRelief);
    private texture: TextureImage = null;

    public constructor(_name: string = "MeshRelief", _texture: TextureImage = null) {
      super(_name, Vector2.ONE(2), undefined, (_x: number, _z: number) => 0);
      this.setTexture(_texture);
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

    public setTexture(_texture: TextureImage = null): void {
      if (!_texture)
        return;
      this.texture = _texture;
      super.create(_texture ? new Vector2(_texture.image.width - 1, _texture.image.height - 1) : undefined, undefined, MeshRelief.createHeightMapFunction(_texture));
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      delete serialization.seed;
      delete serialization.scale;
      delete serialization.resolution;

      if (this.texture)
        serialization.idTexture = this.texture.idResource;

      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      if (_serialization.idTexture) {
        this.texture = <TextureImage>await Project.getResource(_serialization.idTexture);
        this.setTexture(this.texture);
      }
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      this.setTexture(_mutator.texture);
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.seed;
      delete _mutator.scale;
      delete _mutator.resolution;
    }
    //#endregion

    protected createVertices(): Float32Array {
      let vertices: Vector3[] = [];
      // let vertices: Float32Array = new Float32Array((this.resolution.x + 1) * (this.resolution.y + 1) * 3);
      //Iterate over each cell to generate grid of vertices
      let row: Vector3[];
      for (let z: number = 0; z <= this.resolution.y; z++) {
        row = [];
        for (let x: number = 0; x <= this.resolution.x; x++) {
          let xNorm: number = x / this.resolution.x;
          let zNorm: number = z / this.resolution.y;
          row.push(new Vector3(
            xNorm - 0.5,
            this.heightMapFunction(x, z),
            zNorm - 0.5
          ));
        }
        vertices.push(...row);
        if (z > 0 && z <= this.resolution.y - 1) // duplicate row to separate vertex- and face-normals
          vertices.push(...row);
      }
      return new Float32Array(vertices.map((_v: Vector3) => [_v.x, _v.y, _v.z]).flat());
    }
  }
}