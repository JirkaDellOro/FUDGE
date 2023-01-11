///<reference path="./../Render/RenderInjectorMeshSkin.ts"/>
///<reference path="./MeshImport.ts"/>
namespace FudgeCore {
  /**
   * Mesh influenced by a skeleton
   * @author Matthias Roming, HFU, 2022
   */
  @RenderInjectorMeshSkin.decorate
  export class MeshSkin extends MeshImport {

    public async loadFromGLTF(_loader: GLTFLoader, _gltfMesh: GLTF.Mesh): Promise<MeshSkin> {
      await super.loadFromGLTF(_loader, _gltfMesh);
      Reflect.set(this.renderMesh, "ƒiBones", await _loader.getUint8Array(_gltfMesh.primitives[0].attributes.JOINTS_0));
      Reflect.set(this.renderMesh, "ƒweights", await _loader.getFloat32Array(_gltfMesh.primitives[0].attributes.WEIGHTS_0));
      this.createBones();
      return this;
    }

    public async loadFromFBX(_loader: FBXLoader, _fbxMesh: FBX.Geometry): Promise<MeshSkin> {
      await super.loadFromFBX(_loader, _fbxMesh);
      const fbxDeformer: FBX.Deformer = _fbxMesh.children[0];
      const skeleton: Skeleton = await _loader.getSkeleton(fbxDeformer.children[0].children[0]); // Deformer.SubDeformer.LimbNode
      for (const fbxSubDeformer of fbxDeformer.children as FBX.SubDeformer[]) {
        fbxSubDeformer.load();
        if (fbxSubDeformer.Indexes)
          for (let iBoneInfluence: number = 0; iBoneInfluence < fbxSubDeformer.Indexes.length; iBoneInfluence++) {
            const iVertex: number = fbxSubDeformer.Indexes[iBoneInfluence];
            if (this.vertices[iVertex])
              (this.vertices[iVertex].bones || (this.vertices[iVertex].bones = [])).push({
                index: skeleton.indexOfBone(fbxSubDeformer.children[0].name),
                weight: fbxSubDeformer.Weights[iBoneInfluence] || 1
              });
          }
      }
      return this;
    }

    public useRenderBuffers(_shader: ShaderInterface, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers { return null; /* injected by RenderInjector*/ }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }

    private createBones(): void {
      for (let iVertex: number = 0, iBoneEntry: number = 0; iVertex < this.vertices.length; iVertex++) {
        this.vertices[iVertex].bones = [];
        for (let i: number = 0; i < 4; i++, iBoneEntry++) {
          this.vertices[iVertex].bones.push({
            index: this.renderMesh.iBones[iBoneEntry],
            weight: this.renderMesh.weights[iBoneEntry]
          });
        }
      }
    }
    
  }
}