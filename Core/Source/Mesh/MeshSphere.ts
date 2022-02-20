namespace FudgeCore {
  /**
   * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
   * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshSphere extends MeshRotation {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshSphere);
    private stacks: number;

    public constructor(_name: string = "MeshSphere", _sectors: number = 8, _stacks: number = 8) {
      super(_name);
      this.create(_sectors, _stacks);
    }

    public create(_sectors: number = 3, _stacks: number = 2): void {
      this.clear();
      //Clamp resolution to prevent performance issues
      this.sectors = Math.min(Math.round(_sectors), 128);
      this.stacks = Math.min(Math.round(_stacks), 128);

      if (_sectors < 3 || _stacks < 2) {
        Debug.warn("UV Sphere must have at least 3 sectors and 2 stacks to form a 3-dimensional shape.");
        this.sectors = Math.max(3, _sectors);
        this.stacks = Math.max(2, _stacks);
      }

      let shape: Vector2[] = [];
      let stackStep: number = Math.PI / this.stacks;
      for (let i: number = 0; i <= this.stacks; ++i) {
        let stackAngle: number = Math.PI / 2 - i * stackStep;
        let x: number = Math.cos(stackAngle);
        let y: number = Math.sin(stackAngle);

        shape.push(new Vector2(x / 2, y / 2));
      }
      // place first and last vertex exactly on rotation axis
      shape[0].x = 0;
      shape[shape.length-1].x = 0;

      super.rotate(shape, _sectors);
    }


    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.sectors = this.sectors;
      serialization.stacks = this.stacks;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.create(_serialization.sectors, _serialization.stacks);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(_mutator.sectors, _mutator.stacks);
    }
    //#endregion
  }
}