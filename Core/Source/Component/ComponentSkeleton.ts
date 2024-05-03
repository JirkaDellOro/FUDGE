///<reference path="./../Render/RenderInjectorComponentSkeleton.ts"/>
namespace FudgeCore {

  /**
   * Holds an array of bones ({@link Node}s within a {@link Graph}). Referenced from a {@link ComponentMesh} it can be associated with a {@link Mesh} and enable skinning for the mesh.
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2023
   */
  @RenderInjectorComponentSkeleton.decorate
  export class ComponentSkeleton extends Component {
    /** The bones used for skinning */
    public bones: Node[];
    /** When applied to vertices, it moves them from object/model space to bone-local space as if the bone were at its initial pose */
    public mtxBindInverses: Matrix4x4[]; // TODO: think about serializing this separately to make it shareable between skeleton serializations

    protected renderBuffer: unknown;
    protected singleton: boolean = false;
    /** Contains the bone transformations applicable to the vertices of a {@link Mesh} */
    protected readonly mtxBones: Matrix4x4[] = [];

    public constructor(_bones: Node[] = [], _mtxBoneInverses: Matrix4x4[] = []) {
      super();
      this.bones = _bones;
      this.mtxBindInverses = _mtxBoneInverses;

      for (let i: number = 0; i < this.bones.length; i++)
        if (this.mtxBindInverses[i] == null)
          this.mtxBindInverses[i] = this.bones[i].mtxWorldInverse.clone;
    }

    /**
     * Injected by {@link RenderInjectorComponentSkeleton}.
     * Used by the render system.
     * @internal
     */
    public useRenderBuffer(_shader: ShaderInterface): RenderBuffers { return null; /* injected by RenderInjector*/ }
    /**
     * Injected by {@link RenderInjectorComponentSkeleton}.
     * Used by the render system.
     * @internal
     */
    public updateRenderBuffer(): RenderBuffers { return null; /* injected by RenderInjector*/ }
    /**
     * Injected by {@link RenderInjectorComponentSkeleton}.
     * Used by the render system.
     * @internal
     */
    public deleteRenderBuffer(): void {/* injected by RenderInjector*/ }

    /**
     * Adds a node as a bone with its bind inverse matrix
     */
    public addBone(_bone: Node, _mtxBindInverse: Matrix4x4 = _bone.mtxWorldInverse.clone): void {
      this.bones.push(_bone);
      this.mtxBindInverses.push(_mtxBindInverse);
    }

    /**
     * Return the index of the first bone in the bones array which has the given name, and -1 otherwise.
     */
    public indexOf(_name: string): number;
    /**
     * Return the index of the first occurrence of the given bone node in the bone array, or -1 if it is not present.
     */
    public indexOf(_node: Node): number;
    public indexOf(_name: string | Node): number {
      if (typeof (_name) == "string")
        return this.bones.findIndex((_bone: Node) => _bone.name == _name);
      else
        return this.bones.indexOf(_name);
    }

    /**
     * Updates the bone matrices to be used by the shader
     */
    public update(): void {
      for (const mtxBone of this.mtxBones)
        Recycler.store(mtxBone);
      this.mtxBones.length = 0;

      for (let i: number = 0; i < this.bones.length; i++) {
        let mtxBone: Matrix4x4 = Matrix4x4.MULTIPLICATION(this.bones[i].mtxWorld, this.mtxBindInverses[i]);
        this.mtxBones.push(mtxBone);
      }
    }

    /**
     * Resets the pose of this skeleton to the default pose
     */
    public resetPose(): void { // TODO: test this
      for (let i: number = 0; i < this.bones.length; i++)
        this.bones[i].mtxLocal.set(Matrix4x4.INVERSION(this.mtxBindInverses[i]));
    }

    public serialize(): Serialization {
      const serialization: Serialization = {};
      serialization[super.constructor.name] = super.serialize();
      serialization.bones = this.bones.map(_bone => Node.PATH_FROM_TO(this, _bone));
      serialization.mtxBindInverses = Serializer.serializeArray(Matrix4x4, this.mtxBindInverses);
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<ComponentSkeleton> {
      await super.deserialize(_serialization[super.constructor.name]);

      const hndNodeDeserialized: EventListenerUnified = () => {
        this.bones = _serialization.bones.map((_path: string) => {
          let bone: Node = Node.FIND(this, _path) as Node;
          if (!bone)
            throw new Error(`${Node.name} "${this.node.name}" ${ComponentSkeleton.name}: Could not find bone ${_path}`);
          return bone;
        });
        this.removeEventListener(EVENT.NODE_DESERIALIZED, hndNodeDeserialized);
      };
      this.addEventListener(EVENT.NODE_DESERIALIZED, hndNodeDeserialized);

      this.mtxBindInverses = <Matrix4x4[]>await Serializer.deserializeArray(_serialization.mtxBindInverses);
      return this;
    }
  }

}