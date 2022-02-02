namespace FudgeCore {
  export class Skeleton extends Graph {

    public readonly bones: BoneList = {};
    public readonly mtxBindInverses: BoneMatrixList = {};
    
    /**
     * Creates a new skeleton with a name
     */
    constructor(_name: string = "Skeleton") {
      super(_name);
      this.addEventListener(EVENT.CHILD_REMOVE, this.hndChildRemove);
    }

    /**
     * Appends a node to this skeleton or the given parent and registers it as a bone
     * @param _mtxInit initial local matrix
     * @param _parentName name of the parent node, that must be registered as a bone
     */
    public addBone(_bone: Node, _mtxInit?: Matrix4x4, _parentName?: string): void {
      if (_parentName)
        this.bones[_parentName].addChild(_bone);
      else
        this.addChild(_bone);
      if (!_bone.cmpTransform)
        _bone.addComponent(new ComponentTransform());
      if (_mtxInit)
        _bone.mtxLocal.set(_mtxInit);
      this.calculateMtxWorld(_bone);
      this.registerBone(_bone);
    }

    /**
     * Registers a node as a bone with its bind inverse matrix
     * @param _bone the node to be registered, that should be a descendant of this skeleton
     * @param _mtxBindInverse a precalculated inverse matrix of the bind pose from the bone
     */
    public registerBone(_bone: Node, _mtxBindInverse: Matrix4x4 = _bone.mtxWorldInverse): void {
      this.bones[_bone.name] = _bone;
      this.mtxBindInverses[_bone.name] = _mtxBindInverse;
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
        if (_boneName == boneName)
          return index;
        index++;
      }
      return -1;
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.mtxBindInverses = {};
      for (const boneName in this.mtxBindInverses)
        serialization.mtxBindInverses[boneName] = this.mtxBindInverses[boneName].serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      for (const node of this) if (_serialization.mtxBindInverses[node.name])
        this.registerBone(node, await new Matrix4x4().deserialize(_serialization.mtxBindInverses[node.name]) as Matrix4x4);
      return this;
    }

    /**
     * Calculates and sets the world matrix of a bone relative to its parent
     */
    private calculateMtxWorld(_node: Node): void {
      _node.mtxWorld.set(
        _node.cmpTransform ?
        Matrix4x4.MULTIPLICATION(_node.getParent().mtxWorld, _node.mtxLocal) :
        _node.getParent().mtxWorld
      );
    }

    /**
     * Deregisters all bones of a removed node
     */
    private hndChildRemove = (_event: Event) => {
      if (_event.currentTarget != this) return;
      for (const node of _event.target as Node) if (this.bones[node.name]) {
        delete this.bones[node.name];
        delete this.mtxBindInverses[node.name];
      }
    }

  }
}