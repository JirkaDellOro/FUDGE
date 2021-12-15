namespace FudgeCore {
  export class Skeleton extends Graph {

    public readonly bones: BoneList = {};
    public readonly mtxBindInverses: BoneMatrix4x4List;

    private calculateMtxBindInversesOnChildAppend: boolean;
    
    /**
     * Creates a new skeleton with a name
     */
    constructor(_name: string = "Skeleton", _rootBone?: Bone, _mtxBindInverses?: BoneMatrix4x4List) {
      super(_name);

      this.addEventListener(EVENT.CHILD_APPEND, this.onChildAppend);
      this.addEventListener(EVENT.CHILD_REMOVE, this.onChildRemove);

      if (_mtxBindInverses) {
        this.mtxBindInverses = _mtxBindInverses;
        this.calculateMtxBindInversesOnChildAppend = false;
      }
      else {
        this.mtxBindInverses = {};
        this.calculateMtxBindInversesOnChildAppend = true;
      }

      if (_rootBone) this.addChild(_rootBone);

      this.calculateMtxBindInversesOnChildAppend = true;
    }

    /**
     * Sets the current state of this skeleton as the default pose
     * by updating the inverse bind matrices
     */
    public setDefaultPose(): void {
      for (const boneName in this.bones) {
        this.calculateMtxWorld(this.bones[boneName]);
        this.mtxBindInverses[boneName] = this.bones[boneName].mtxWorldInverse;
      }
    }

    public indexOfBone(_boneName: string): number {
      let index: number = 0;
      for (const boneName in this.bones) {
        if (_boneName == boneName) return index;
        index++;
      }
      return -1;
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.mtxBindInverses = {};
      for (const boneName in this.mtxBindInverses) {
        serialization.mtxBindInverses[boneName] = this.mtxBindInverses[boneName].serialize();
      }
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      // deactivate calculation of inverse bind matrices to load them from the serialization instead
      this.calculateMtxBindInversesOnChildAppend = false;

      await super.deserialize(_serialization);
      for (const boneName in _serialization.mtxBindInverses) {
        this.mtxBindInverses[boneName] = await new Matrix4x4().deserialize(_serialization.mtxBindInverses[boneName]) as Matrix4x4;
      }

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
      this.bones[_bone.name] = _bone;
      if (this.calculateMtxBindInversesOnChildAppend) {
        this.calculateMtxWorld(_bone);
        this.mtxBindInverses[_bone.name] = _bone.mtxWorldInverse;
      }
    }

    private deregisterBone(_bone: Bone): void {
      delete this.bones[_bone.name];
      delete this.mtxBindInverses[_bone.name];
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