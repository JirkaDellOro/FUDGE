namespace FudgeCore {

  export enum BASE {
    SELF, PARENT, WORLD, NODE
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

    //#region Transformations respecting the hierarchy
    public lookAt(_targetWorld: Vector3, _up?: Vector3): void {
      let container: Node = this.getContainer();
      if (!container && !container.getParent())
        return this.local.lookAt(_targetWorld, _up);

      // component is attached to a child node -> transform respecting the hierarchy
      let mtxWorld: Matrix4x4 = container.mtxWorld.copy;
      mtxWorld.lookAt(_targetWorld, _up, true);
      let local: Matrix4x4 = Matrix4x4.RELATIVE(mtxWorld, null, container.getParent().mtxWorldInverse);
      this.local = local;
    }

    public showTo(_targetWorld: Vector3, _up?: Vector3): void {
      let container: Node = this.getContainer();
      if (!container && !container.getParent())
        return this.local.showTo(_targetWorld, _up);

      // component is attached to a child node -> transform respecting the hierarchy
      let mtxWorld: Matrix4x4 = container.mtxWorld.copy;
      mtxWorld.showTo(_targetWorld, _up, true);
      let local: Matrix4x4 = Matrix4x4.RELATIVE(mtxWorld, null, container.getParent().mtxWorldInverse);
      this.local = local;
    }

    public rebase(_node: Node = null): void {
      let mtxResult: Matrix4x4 = this.local;
      let container: Node = this.getContainer();
      if (container)
        mtxResult = container.mtxWorld;

      if (_node)
        mtxResult = Matrix4x4.RELATIVE(mtxResult, null, _node.mtxWorldInverse);

      this.local = mtxResult;
    }

    public transform(_transform: Matrix4x4, _base: BASE = BASE.SELF, _node: Node = null): void {
      switch (_base) {
        case BASE.SELF:
          this.local.multiply(_transform);
          break;
        case BASE.PARENT:
          this.local.multiply(_transform, true);
          break;
        case BASE.NODE:
          if (!_node)
            throw new Error("BASE.NODE requires a node given as base");
        case BASE.WORLD:
          this.rebase(_node);
          this.local.multiply(_transform, true);

          let container: Node = this.getContainer();
          if (container) {
            if (_base == BASE.NODE)
              // fix mtxWorld of container for subsequent rebasing 
              container.mtxWorld.set(Matrix4x4.MULTIPLICATION(_node.mtxWorld, container.mtxLocal));

            let parent: Node = container.getParent();
            if (parent) {
              // fix mtxLocal for current parent
              this.rebase(container.getParent());
              container.mtxWorld.set(Matrix4x4.MULTIPLICATION(container.getParent().mtxWorld, container.mtxLocal));
            }
          }
          break;
      }
    }
    //#endregion

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
