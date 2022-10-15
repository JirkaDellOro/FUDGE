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
        let pixel: number = Math.round(_z * _texture.image.width + _x);
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
      let resolution: Vector2 = _texture ? new Vector2(_texture.image.width - 1, _texture.image.height - 1) : undefined;
      super.create(resolution, resolution, MeshRelief.createHeightMapFunction(_texture));
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
      if (typeof (_mutator.texture) !== "undefined")
        this.setTexture(_mutator.texture);
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.seed;
      delete _mutator.scale;
      delete _mutator.resolution;
    }
    //#endregion
  }
}