namespace FudgeCore {
  export class Skeleton extends Graph {

    public readonly bones: Array<Bone> = new Array();

    /**
     * The inverse matrices of the bone bind transformations relative to this skeleton
     */
    public readonly mtxBindInverses: Array<Matrix4x4>;

    private calculateMtxBindInversesOnChildAppend: boolean;
    
    /**
     * Creates a new skeleton with a name
     */
    constructor(_name: string = "Skeleton", _rootBone?: Bone, _mtxBindInverses?: Array<Matrix4x4>) {
      super(_name);

      this.addEventListener(EVENT.CHILD_APPEND, this.onChildAppend);
      this.addEventListener(EVENT.CHILD_REMOVE, this.onChildRemove);

      if (_mtxBindInverses) {
        this.mtxBindInverses = _mtxBindInverses;
        this.calculateMtxBindInversesOnChildAppend = false;
      }
      else {
        this.mtxBindInverses = new Array();
        this.calculateMtxBindInversesOnChildAppend = true;
      }

      if (_rootBone) this.addChild(_rootBone);

      this.calculateMtxBindInversesOnChildAppend = true;
    }

    /**
     * Sets the current state of this skeleton as the default pose
     * by updating the inverse matrices
     */
    public setDefaultPose(): void {
      // clear the list of inverse bind matrices
      this.mtxBindInverses.length = 0;

      // recalculate the inverse bind matrices
      this.bones.forEach(bone => this.calculateMtxWorld(bone));
      this.mtxBindInverses.push(...this.bones.map(bone => bone.mtxWorldInverse));
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.mtxBindInverses = Serializer.serializeArray(Matrix4x4, this.mtxBindInverses);
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      // deactivate calculation of inverse bind matrices to load them from the serialization instead
      this.calculateMtxBindInversesOnChildAppend = false;

      await super.deserialize(_serialization);
      this.mtxBindInverses.push(...await Serializer.deserializeArray(_serialization.mtxBindInverses) as Array<Matrix4x4>);

      this.calculateMtxBindInversesOnChildAppend = true;
      return this;
    }

    /**
     * Registers all bones of a appended node
     */
    private onChildAppend = (_event: Event) => {
      if (_event.currentTarget == this) {
        for (const node of _event.target as Node) {
          if (node instanceof Bone)
            this.registerBone(node);
        }
      }
    }

    /**
     * Deregisters all bones of a removed node
     */
    private onChildRemove = (_event: Event) => {
      if (_event.currentTarget == this) {
        for (const node of _event.target as Node) {
          if (node instanceof Bone)
            this.deregisterBone(node);
        }
      }
    }

    private registerBone(_bone: Bone): void {
      this.bones.push(_bone);
      if (this.calculateMtxBindInversesOnChildAppend) {
        this.calculateMtxWorld(_bone);
        this.mtxBindInverses.push(_bone.mtxWorldInverse);
      }
    }

    private deregisterBone(_bone: Bone): void {
      const boneIndex: number = this.bones.indexOf(_bone);
      this.bones.splice(boneIndex);
      this.mtxBindInverses.splice(boneIndex);
    }

    /**
     * Calculates and sets the world matrix of a bone relative to its parent
     */
    private calculateMtxWorld(_node: Bone): void {
      if (!(_node.getParent() instanceof Bone || _node.getParent() == this))
        throw new Error("Bone has an invalid parent. The Parent must be a bone or a skeleton.");

      if (!_node.cmpTransform)
        _node.addComponent(new ComponentTransform());

      _node.mtxWorld.set(Matrix4x4.MULTIPLICATION(_node.getParent().mtxWorld, _node.mtxLocal));
    }

  }
}