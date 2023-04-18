namespace FudgeCore {
  /**
   * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
   * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshSphere extends MeshRotation {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshSphere);
    private latitudes: number;

    public constructor(_name: string = "MeshSphere", _longitudes: number = 8, _latitudes: number = 8) {
      super(_name);
      this.create(_longitudes, _latitudes);
    }

    public create(_longitudes: number = 3, _latitudes: number = 2): void {
      this.clear();
      //Clamp resolution to prevent performance issues
      this.longitudes = Math.min(Math.round(_longitudes), 128);
      this.latitudes = Math.min(Math.round(_latitudes), 128);

      if (_longitudes < 3 || _latitudes < 2) {
        Debug.warn("UV Sphere must have at least 3 longitudes and 2 latitudes to form a 3-dimensional shape.");
        this.longitudes = Math.max(3, _longitudes);
        this.latitudes = Math.max(2, _latitudes);
      }

      let shape: Vector2[] = [];
      let step: number = Math.PI / this.latitudes;
      for (let i: number = 0; i <= this.latitudes; ++i) {
        let angle: number = Math.PI / 2 - i * step;
        let x: number = Math.cos(angle);
        let y: number = Math.sin(angle);

        shape.push(new Vector2(x / 2, y / 2));
      }
      // place first and last vertex exactly on rotation axis
      shape[0].x = 0;
      shape[shape.length - 1].x = 0;

      super.rotate(shape, _longitudes);
    }


    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      delete serialization.shape;
      serialization.latitudes = this.latitudes;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.create(_serialization.longitudes, _serialization.latitudes);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.longitudes, this.latitudes);
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.shape;
    }
    //#endregion
  }
}