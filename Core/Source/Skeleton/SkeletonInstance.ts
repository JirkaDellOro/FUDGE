///<reference path="./../Render/RenderInjectorSkeletonInstance.ts"/>
namespace FudgeCore {
  let instanceCounter: number = 0;

  /**
   * An instance of a {@link Skeleton}.
   * It holds all the information needed to animate itself. Referenced from a {@link ComponentMesh} it can be associated with a {@link MeshSkin} and enable skeleton animation for the mesh.
   * As an extension of {@link GraphInstance} it also keeps a reference to its resource and can thus optimize serialization.
   */
  @RenderInjectorSkeletonInstance.decorate
  export class SkeletonInstance extends GraphInstance {
    /**
     * Contains the bone transformations applicable to the vertices of a {@link MeshSkin}
     * @internal
     */
    protected readonly mtxBones: Matrix4x4[] = [];

    /**
     * The bone matrices render buffer
     */
    protected renderBuffer: unknown;

    // public bindPose: BoneMatrixList;
    private skeletonSource: Skeleton;

    #bones: BoneList;
    #mtxBoneLocals: BoneMatrixList;

    public constructor(_name: string = "SkeletonInstance_" + instanceCounter++) {
      super();
      Reflect.set(this, "instacnename", _name);
    }

    /**
     * Creates a new {@link SkeletonInstance} based on the given {@link Skeleton}
     */
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
     * Injected by {@link RenderInjectorSkeletonInstance}.
     * Used by the render system.
     * @internal
     */
    public useRenderBuffer(_shader: ShaderInterface): RenderBuffers { return null; /* injected by RenderInjector*/ }
    /**
     * Injected by {@link RenderInjectorSkeletonInstance}.
     * Used by the render system.
     * @internal
     */
    public updateRenderBuffer(): RenderBuffers { return null; /* injected by RenderInjector*/ }
    /**
     * Injected by {@link RenderInjectorSkeletonInstance}.
     * Used by the render system.
     * @internal
     */
    public deleteRenderBuffer(): void {/* injected by RenderInjector*/ }

    /**
     * Set this skeleton instance to be a recreation of the {@link Skeleton} given
     */
    public async set(_skeleton: Skeleton): Promise<void> {
      await super.set(_skeleton);
      // this.skeletonSource = _skeleton; // TODO: check if these lines are needed as super.set calls deserialize
      // this.registerBones();
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      // if (this.bindPose) {
      //   serialization.bindPose = {};
      //   for (const boneName in this.bindPose)
      //     serialization.bindPose[boneName] = this.bindPose[boneName].serialize();
      // }
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.skeletonSource = Project.resources[_serialization.idSource || _serialization.idResource] as Skeleton;
      // for (const node of this) {
      //   const cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
      //   if (cmpMesh?.skeleton)
      //     cmpMesh.skeleton = this;
      // }
      this.registerBones();
      // if (_serialization.bindPose) {
      //   this.bindPose = {};
      //   for (const boneName in _serialization.bindPose)
      //     this.bindPose[boneName] = await new Matrix4x4().deserialize(_serialization.bindPose[boneName]) as Matrix4x4;
      // }
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
        for (const boneName in _mutator.mtxBoneLocals) // shortcut to mutate the local matrix of a bone, bypassing the hierarchy
          this.mtxBoneLocals[boneName]?.mutate(_mutator.mtxBoneLocals[boneName]);
      if (_mutator.bones)
        for (const boneName in _mutator.bones)
          this.bones[boneName]?.applyAnimation(_mutator.bones[boneName]);
    }

    public calculateMtxBones(): void {
      for (const mtxBone of this.mtxBones)
        Recycler.store(mtxBone);
      this.mtxBones.length = 0;

      for (const boneName in this.bones) {
        // Bones mtxWorld represents the animated transformation of the bone.
        // Combines with the inverse bind pose matrix for correct vertex animation.
        const mtxBone: Matrix4x4 = Matrix4x4.MULTIPLICATION(this.bones[boneName].mtxWorld, this.skeletonSource.mtxBindInverses[boneName]);
        this.mtxBones.push(mtxBone);
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
