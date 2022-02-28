namespace FudgeCore {
  /**
   * Attaches a {@link Mesh} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentMesh extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentMesh);
    public mtxPivot: Matrix4x4 = Matrix4x4.IDENTITY();
    public readonly mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY();
    public mesh: Mesh = null;

    public constructor(_mesh: Mesh = null) {
      super();
      this.mesh = _mesh;
    }

    public get radius(): number {
      let scaling: Vector3 = this.mtxWorld.scaling;
      let scale: number = Math.max(Math.abs(scaling.x), Math.abs(scaling.y), Math.abs(scaling.z));
      return this.mesh.radius * scale;
    }

    // TODO: remove or think if the transformed bounding box is of value or can be made to be
    // public get boundingBox(): Box {
    //   let box: Box = Recycler.get(Box);
    //   box.set(
    //     Vector3.TRANSFORMATION(this.mesh.boundingBox.min, this.mtxWorld, true),
    //     Vector3.TRANSFORMATION(this.mesh.boundingBox.max, this.mtxWorld, true)
    //   );
    //   return box;
    // }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization;
      /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
      let idMesh: string = this.mesh.idResource;
      if (idMesh)
        serialization = { idMesh: idMesh };
      else
        serialization = { mesh: Serializer.serialize(this.mesh) };

      serialization.pivot = this.mtxPivot.serialize();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      let mesh: Mesh;
      if (_serialization.idMesh)
        mesh = <Mesh>await Project.getResource(_serialization.idMesh);
      else
        mesh = <Mesh>await Serializer.deserialize(_serialization.mesh);
      this.mesh = mesh;

      await this.mtxPivot.deserialize(_serialization.pivot);
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      let mutator: MutatorForUserInterface = <MutatorForUserInterface>this.getMutator();
      // if (!this.mesh)
      //   mutator.mesh = Mesh;
      return mutator;
    }
    //#endregion
  }
}
