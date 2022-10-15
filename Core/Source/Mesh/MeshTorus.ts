namespace FudgeCore {
  /**
   * Generate a Torus with a given thickness and the number of major- and minor segments
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshTorus extends MeshRotation {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshTorus);
    private size: number = 0.25;
    private latitudes: number = 12;

    public constructor(_name: string = "MeshTorus", _size: number = 0.25, _longitudes: number = 8, _latitudes: number = 6) {
      super(_name, MeshTorus.getShape(_size, Math.max(3, _latitudes)), _longitudes);
      this.size = _size;
      this.longitudes = _longitudes;
      this.latitudes = Math.max(3, _latitudes);
    }

    private static getShape(_size: number, _latitudes: number): Vector2[] {
      let shape: Vector2[] = [];
      let radius: number = _size / 2;
      let center: Vector2 = new Vector2(0.25 + radius, 0);
      for (let latitude: number = 0; latitude <= _latitudes; latitude++) {
        let angle: number = 2 * Math.PI * latitude / _latitudes;
        shape.push(Vector2.SUM(center, new Vector2(radius * -Math.cos(angle), radius * Math.sin(angle))));
      }
      return shape;
    }

    public create(_size: number = 0.25, _longitudes: number = 8, _latitudes: number = 6): void {
      this.size = _size;
      this.latitudes = Math.max(3, _latitudes);
      super.rotate(MeshTorus.getShape(_size, _latitudes), _longitudes);
    }


    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.latitudes = this.latitudes;
      serialization.size = this.size;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.create(_serialization.size, _serialization.longitudes, _serialization.latitudes);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.size, this.longitudes, this.latitudes);
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.shape;
    }
    //#endregion
  }
}