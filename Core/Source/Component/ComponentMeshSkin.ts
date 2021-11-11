namespace FudgeCore {
  export class ComponentMeshSkin extends ComponentMesh {

    public readonly skeleton: SkeletonInstance = new SkeletonInstance();
    public mtxSkeleton: Matrix4x4;

    #mesh: MeshSkin;
    #mtxBones: Array<Matrix4x4>;
    #mtxBonesUpdated: number;

    /**
     * Creates a new mesh-skin component with an optional mesh-skin
     * and an optional skeleton component to influence this components mesh
     */
    public constructor(_mesh?: MeshSkin, _skeleton?: Skeleton, _mtxSkeleton: Matrix4x4 = Matrix4x4.IDENTITY()) {
      super(_mesh);
      if (_skeleton) this.skeleton.set(_skeleton);
      if (_mtxSkeleton) this.mtxSkeleton = _mtxSkeleton;

      this.addEventListener(EVENT.COMPONENT_ADD, (event: Event) => {
        if (event.target == this) this.node.addChild(this.skeleton);
      });
    }

    public get mesh(): MeshSkin {
      return this.#mesh;
    }

    public set mesh(_mesh: MeshSkin) {
      this.#mesh = _mesh;
      this.#mesh.component = this;
    }

    /**
     * Gets the bone local transformations
     */
    public get mtxBoneLocals(): Array<Matrix4x4> {
      return this.skeleton.bones.map(bone => bone.mtxLocal);
    }

    /**
     * Gets the bone transformations for a vertex
     */
    public get mtxBones(): Array<Matrix4x4> {
      if (!this.node) return null;

      if (this.#mtxBonesUpdated != this.node.timestampUpdate) {
        this.calculateMtxBones();
        this.#mtxBonesUpdated = this.node.timestampUpdate;
      }

      return this.#mtxBones;
    }

    /**
     * Calculates the position of a vertex transformed by the skeleton
     * @param _index index of the vertex
     */
    public getVertexPosition(_index: number): Vector3 {
      // extract the vertex data (vertices: 3D vectors, bone indices & weights: 4D vectors)
      const vertex: Vector3 = new Vector3(...this.mesh.vertices.slice(_index * 3, _index * 3 + 3));
      const iBones: Uint8Array = (this.mesh as MeshSkin).iBones.slice(_index * 4, _index * 4 + 4);
      const weights: Float32Array = (this.mesh as MeshSkin).weights.slice(_index * 4, _index * 4 + 4);

      // get bone matrices
      const mtxBones: Array<Matrix4x4> = this.mtxBones;

      // skin matrix S = sum_i=1^m{w_i * B_i}
      const skinMatrix: Matrix4x4 = new Matrix4x4();
      skinMatrix.set(Array
        .from(iBones)
        .map((iJoint, iWeight) => mtxBones[iJoint].get().map(value => value * weights[iWeight])) // apply weight on each matrix
        .reduce((mtxBoneA, mtxBoneB) => mtxBoneA.map((value, index) => value + mtxBoneB[index])) // sum up the matrices
      );

      // transform vertex
      vertex.transform(skinMatrix);

      return vertex;
    }

    private calculateMtxBones(): void {
      this.#mtxBones = this.skeleton.bones.map((bone, index) => {
        // bone matrix T = N^-1 * B_delta * B_0^-1 * S
        const boneMatrix: Matrix4x4 = this.node.mtxWorldInverse.clone;
        boneMatrix.multiply(bone.mtxWorld);
        boneMatrix.multiply(this.skeleton.mtxBindInverses[index]);
        boneMatrix.multiply(this.mtxPivot);
        boneMatrix.multiply(this.mtxSkeleton);

        return boneMatrix;
      });
    }

  }
}