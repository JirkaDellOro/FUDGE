namespace FudgeCore {

  export enum BASE {
    SELF, PARENT, WORLD, OTHER
  }

  /**
   * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentTransform extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentTransform);
    public local: Matrix4x4;

    public constructor(_matrix: Matrix4x4 = Matrix4x4.IDENTITY()) {
      super();
      this.local = _matrix;
    }
    
    public lookAt(_targetWorld: Vector3, _up?: Vector3): void {
      let mtxWorld: Matrix4x4 = this.getContainer().mtxWorld;
      mtxWorld.lookAt(_targetWorld, _up, true);
      let local: Matrix4x4 = Matrix4x4.RELATIVE(mtxWorld, null, this.getContainer().getParent().mtxWorldInverse);
      this.local = local;
    }
    // {
    //   this.gun.mtxWorld.lookAt(_enemy.mtxWorld.translation, ƒ.Vector3.Y());
    //   let local: ƒ.Matrix4x4 = ƒ.Matrix4x4.RELATIVE(this.gun.mtxWorld, this.gun.getParent().mtxWorld, this.gun.getParent().mtxWorldInverse);
    //   this.gun.cmpTransform.local = local;
    // }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        local: this.local.serialize(),
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }
    public deserialize(_serialization: Serialization): Serializable {
      super.deserialize(_serialization[super.constructor.name]);
      this.local.deserialize(_serialization.local);
      return this;
    }

    // public mutate(_mutator: Mutator): void {
    //     this.local.mutate(_mutator);
    // }
    // public getMutator(): Mutator { 
    //     return this.local.getMutator();
    // }

    // public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
    //     let types: MutatorAttributeTypes = this.local.getMutatorAttributeTypes(_mutator);
    //     return types;
    // }

    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.world;
      super.reduceMutator(_mutator);
    }
    //#endregion
  }
}
