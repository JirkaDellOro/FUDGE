namespace FudgeCore {

  export enum BASE {
    SELF, PARENT, WORLD, NODE
  }

  /**
   * Attaches a transform-{@link Matrix4x4} to the node, moving, scaling and rotating it in space relative to its parent.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentTransform extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentTransform);
    public mtxLocal: Matrix4x4;

    public constructor(_mtxInit: Matrix4x4 = Matrix4x4.IDENTITY()) {
      super();
      this.mtxLocal = _mtxInit;
    }

    //#region Transformations respecting the hierarchy
    /**
     * recalculates this local matrix to yield the identical world matrix based on the given node.
     * Use rebase before appending the container of this component to another node while preserving its transformation in the world.
     */
    public rebase(_node: Node = null): void {
      let mtxResult: Matrix4x4 = this.mtxLocal;
      let container: Node = this.node;
      if (container)
        mtxResult = container.mtxWorld;

      if (_node)
        mtxResult = Matrix4x4.RELATIVE(mtxResult, null, _node.mtxWorldInverse);

      this.mtxLocal = mtxResult;
    }

    /**
     * Applies the given transformation relative to the selected base (SELF, PARENT, WORLD) or a particular other node (NODE)
     */
    public transform(_mtxTransform: Matrix4x4, _base: BASE = BASE.SELF, _node: Node = null): void {
      switch (_base) {
        case BASE.SELF:
          this.mtxLocal.multiply(_mtxTransform);
          break;
        case BASE.PARENT:
          this.mtxLocal.multiply(_mtxTransform, true);
          break;
        case BASE.NODE:
          if (!_node)
            throw new Error("BASE.NODE requires a node given as base");
        case BASE.WORLD:
          this.rebase(_node);
          this.mtxLocal.multiply(_mtxTransform, true);

          let node: Node = this.node;
          if (node) {
            let mtxTemp: Matrix4x4;
            if (_base == BASE.NODE) {
              // fix mtxWorld of container for subsequent rebasing 
              mtxTemp = Matrix4x4.MULTIPLICATION(_node.mtxWorld, node.mtxLocal);
              node.mtxWorld.set(mtxTemp);
              Recycler.store(mtxTemp);
            }

            let parent: Node = node.getParent();
            if (parent) {
              // fix mtxLocal for current parent
              this.rebase(node.getParent());
              mtxTemp = Matrix4x4.MULTIPLICATION(node.getParent().mtxWorld, node.mtxLocal);
              node.mtxWorld.set(mtxTemp);
              Recycler.store(mtxTemp);
            }
          }
          break;
      }
    }
    //#endregion

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        local: this.mtxLocal.serialize(),
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      await this.mtxLocal.deserialize(_serialization.local);
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
