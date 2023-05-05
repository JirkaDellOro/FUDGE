namespace FudgeCore {
  export class SkeletonInstance extends GraphInstance {

    #bones: BoneList;
    #mtxBoneLocals: BoneMatrixList;
    #mtxBones: Matrix4x4[];
    #mtxBonesUpdated: number;

    public bindPose: BoneMatrixList;
    private skeletonSource: Skeleton;

    public static async CREATE(_skeleton: Skeleton): Promise<SkeletonInstance> {
      const skeleton: SkeletonInstance = new SkeletonInstance();
      await skeleton.set(_skeleton);
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
    public get mtxBones(): Matrix4x4[] {
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
      await super.set(_skeleton);
      this.skeletonSource = _skeleton;
      this.registerBones();
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      if (this.bindPose) {
        serialization.bindPose = {};
        for (const boneName in this.bindPose)
          serialization.bindPose[boneName] = this.bindPose[boneName].serialize();
      }
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.skeletonSource = Project.resources[_serialization.idSource || _serialization.idResource] as Skeleton;
      this.registerBones();
      if (_serialization.bindPose) {
        this.bindPose = {};
        for (const boneName in _serialization.bindPose)
          this.bindPose[boneName] = await new Matrix4x4().deserialize(_serialization.bindPose[boneName]) as Matrix4x4;
      }
      return this;
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
        for (const boneName in _mutator.mtxBoneLocals) {
          const mtxMutator: General = _mutator.mtxBoneLocals[boneName]; // a mutator for a Matrix
          /** TODO: creating Quaternion objects here doesn't seem to be very efficient, 
           * maybe {@link Matrix4x4} should be able to handle quaternion rotations directly
           * see https://docs.unity3d.com/ScriptReference/Matrix4x4.Rotate.html
          */
          if (mtxMutator.rotation?.w != undefined) {
            mtxMutator.rotation = new PhysicsQuaternion(mtxMutator.rotation.x, mtxMutator.rotation.y, mtxMutator.rotation.z, mtxMutator.rotation.w).toDegrees();
          }
          this.mtxBoneLocals[boneName]?.mutate(mtxMutator);
        }
      if (_mutator.bones)
        for (const boneName in _mutator.bones)
          this.bones[boneName]?.applyAnimation(_mutator.bones[boneName]);
    }

    private calculateMtxBones(): void {
      this.#mtxBones = [];
      for (const boneName in this.bones) {
        // bone matrix T = N^-1 * B_delta * B_0^-1 * S
        const mtxBone: Matrix4x4 = this.getParent()?.mtxWorldInverse.clone || Matrix4x4.IDENTITY();
        //mtxBone.multiply(this.bindPose ? this.bindPose[boneName] : this.bones[boneName].getParent().mtxWorld);
        mtxBone.multiply(this.bones[boneName].mtxWorld);
        mtxBone.multiply(this.skeletonSource.mtxBindInverses[boneName]);
        if (this.cmpTransform) mtxBone.multiply(Matrix4x4.INVERSION(this.mtxLocal));

        this.#mtxBones.push(mtxBone);
      }
    }

    private registerBones(): void {
      this.#bones = {};
      this.#mtxBoneLocals = {};
      for (const node of this) if (this.skeletonSource.mtxBindInverses[node.name]) {
        this.bones[node.name] = node;
        this.mtxBoneLocals[node.name] = node.mtxLocal;
      }
    }

  }
}
