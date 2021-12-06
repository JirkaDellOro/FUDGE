namespace FudgeCore {
  export class SkeletonInstance extends GraphInstance {

    public readonly bones: Array<Bone> = new Array();
    public readonly mtxBoneLocals: MutableArray<Matrix4x4> = new MutableArray();

    #mtxBones: Array<Matrix4x4>;
    #mtxBonesUpdated: number;

    private skeletonSource: Skeleton;
    
    /**
     * Creates a new skeleton instance
     */
    public constructor() {
      super();
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
      this.bones.length = 0;
      this.mtxBoneLocals.length = 0;
      this.skeletonSource = _skeleton;
      this.addEventListener(EVENT.CHILD_APPEND, this.onChildAppend);
      await super.set(_skeleton);
      this.removeEventListener(EVENT.CHILD_APPEND, this.onChildAppend);
    }

    /**
     * Resets this skeleton instance to its default pose
     */
    public resetPose(): void {
      this.bones.forEach((bone, index) => bone.mtxLocal.set(Matrix4x4.INVERSION(this.skeletonSource.mtxBindInverses[index])));
    }

    public applyAnimation(_mutator: Mutator): void {
      super.applyAnimation(_mutator);
      if (_mutator.mtxBoneLocals)
        this.mtxBoneLocals.mutate(_mutator.mtxBoneLocals);
      if (_mutator.bones)
        for (let i in _mutator.bones)
          this.bones[+i].applyAnimation(_mutator.bones[i]);
    }

    private calculateMtxBones(): void {
      this.#mtxBones = this.bones.map((bone, index) => {
        // bone matrix T = N^-1 * B_delta * B_0^-1 * S
        const boneMatrix: Matrix4x4 = this.getParent()?.mtxWorldInverse.clone || Matrix4x4.IDENTITY();
        boneMatrix.multiply(bone.mtxWorld);
        boneMatrix.multiply(this.skeletonSource.mtxBindInverses[index]);

        return boneMatrix;
      });
    }

    /**
     * Registers all bones of a appended node
     */
    private onChildAppend = (_event: Event) => {
      for (const node of _event.target as Node) {
        if (node instanceof Bone && !this.bones.includes(node))
          this.registerBone(node);
      }
    }

    private registerBone(_bone: Bone): void {
      this.bones.push(_bone);
      this.mtxBoneLocals.push(_bone.mtxLocal);
    }

  }
}
