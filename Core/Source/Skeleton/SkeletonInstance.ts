namespace FudgeCore {
  export class SkeletonInstance extends GraphInstance {

    public mtxBindShape: Matrix4x4 = Matrix4x4.IDENTITY();

    #bones: BoneList;
    #mtxBoneLocals: BoneMatrixList;
    #mtxBones: Array<Matrix4x4> = [];
    #mtxBonesUpdated: number;

    private skeletonSource: Skeleton;
    
    /**
     * Creates a new skeleton instance
     */
    public constructor() {
      super();
    }

    public static async CREATE(_source: Skeleton): Promise<SkeletonInstance> {
      const skeleton: SkeletonInstance = new SkeletonInstance();
      await skeleton.set(_source);
      return skeleton;
    }

    public get bones(): BoneList {
      return this.#bones;
    }

    public get mtxBoneLocals(): BoneMatrixList {
      return this.#mtxBoneLocals;
    }

    /**
     * Gets the bone transformations for a vertex
     */
    public get mtxBones(): Array<Matrix4x4> {
      if (this.#mtxBonesUpdated != this.timestampUpdate) {
        this.calculateMtxBones();
        this.#mtxBonesUpdated = this.timestampUpdate;
      }

      return this.#mtxBones;
    }

    /**
     * Set this skeleton instance to be a recreation of the {@link Skeleton} given
     */
    public async set(_skeleton: Skeleton): Promise<void> {
      this.skeletonSource = _skeleton;
      this.#bones = {};
      this.#mtxBoneLocals = {};
      this.addEventListener(EVENT.CHILD_APPEND, this.hndChildAppend);
      this.addEventListener(EVENT.CHILD_REMOVE, this.hndChildRemove);
      await super.set(_skeleton);
      this.removeEventListener(EVENT.CHILD_APPEND, this.hndChildAppend);
      this.removeEventListener(EVENT.CHILD_REMOVE, this.hndChildRemove);
    }

    /**
     * Resets this skeleton instance to its default pose
     */
    public resetPose(): void {
      for (const boneName in this.bones)
        this.bones[boneName].mtxLocal.set(Matrix4x4.INVERSION(this.skeletonSource.mtxBindInverses[boneName]));
    }

    public applyAnimation(_mutator: Mutator): void {
      super.applyAnimation(_mutator);
      if (_mutator.mtxBoneLocals)
        for (const boneName in _mutator.mtxBoneLocals)
          this.mtxBoneLocals[boneName]?.mutate(_mutator.mtxBoneLocals[boneName]);
      if (_mutator.bones)
        for (const boneName in _mutator.bones)
          this.bones[boneName]?.applyAnimation(_mutator.bones[boneName]);
    }

    private calculateMtxBones(): void {
      this.#mtxBones.length = 0;
      for (const boneName in this.bones) {
        // bone matrix T = N^-1 * B_delta * B_0^-1 * S
        const mtxBone: Matrix4x4 = this.getParent()?.mtxWorldInverse.clone || Matrix4x4.IDENTITY();
        mtxBone.multiply(this.bones[boneName].mtxWorld);
        mtxBone.multiply(this.skeletonSource.mtxBindInverses[boneName]);
        if (this.cmpTransform) mtxBone.multiply(Matrix4x4.INVERSION(this.mtxLocal));

        this.#mtxBones.push(mtxBone);
      }
    }

    /**
     * Registers all bones of a appended node
     */
    private hndChildAppend = (_event: Event) => {
      if (_event.currentTarget != this) return;
      for (const node of _event.target as Node) if (this.skeletonSource.bones[node.name]) {
        this.bones[node.name] = node;
        this.mtxBoneLocals[node.name] = node.mtxLocal;
      }
    }

    /**
     * Deregisters all bones of a removed node
     */
    private hndChildRemove = (_event: Event) => {
      if (_event.currentTarget != this) return;
      for (const node of _event.target as Node) if (this.bones[node.name]) {
        delete this.bones[node.name];
        delete this.mtxBoneLocals[node.name];
      }
    }

  }
}
