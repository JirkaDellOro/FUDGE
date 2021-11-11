namespace FudgeCore {
  export class SkeletonInstance extends GraphInstance {

    public readonly bones: Array<Bone> = new Array();

    private skeletonSource: Skeleton;
    
    /**
     * Creates a new skeleton instance
     */
    constructor() {
      super();
      this.addEventListener(EVENT.CHILD_APPEND, this.onChildAppend);
    }

    /**
     * Gets the inverse matrices of the bone bind transformations relative to this skeleton instance
     */
    public get mtxBindInverses(): Array<Matrix4x4> {
      return this.skeletonSource.mtxBindInverses;
    }

    /**
     * Set this skeleton instance to be a recreation of the {@link Skeleton} given
     */
    public async set(_skeleton: Skeleton): Promise<void> {
      this.skeletonSource = _skeleton;
      await super.set(_skeleton);
    }

    /**
     * Resets this skeleton instance to its default pose
     */
    public resetPose(): void {
      this.bones.forEach((bone, index) => bone.mtxLocal.set(Matrix4x4.INVERSION(this.mtxBindInverses[index])));
    }

    /**
     * Registers all bones of a appended node
     */
    private onChildAppend = (_event: Event) => {
      for (const node of _event.target as Node) {
        if (node instanceof Bone)
          this.bones.push(node);
      }
    }

  }
}
