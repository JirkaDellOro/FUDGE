namespace FudgeCore {
  export class MeshGLTF extends Mesh {

    private uriGLTF: string;
    private iGLTF: number;

    public static async LOAD(_loader: GLTFLoader, _iMesh: number): Promise<MeshGLTF> {
      return await new MeshGLTF(_loader.gltf.meshes[_iMesh].name).load(_loader, _iMesh);
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.uriGLTF = this.uriGLTF;
      serialization.iGLTF = this.iGLTF;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      const loader: GLTFLoader = await GLTFLoader.LOAD(_serialization.uriGLTF);
      await this.load(loader, _serialization.iGLTF);
      return this;
    }

    protected async load(_loader: GLTFLoader, _iMesh: number): Promise<MeshGLTF> {
      const gltfMesh: GLTF.Mesh = _loader.gltf.meshes[_iMesh];
      this.ƒindices = await _loader.getUint16Array(gltfMesh.primitives[0].indices);
      this.ƒvertices = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.POSITION);
      this.ƒnormals = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.NORMAL);
      this.ƒtextureUVs = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.TEXCOORD_0);
      this.uriGLTF = _loader.uri;
      this.iGLTF = _iMesh;
      return this;
    }
    
  }
}