namespace FudgeCore {
  export class MeshGLTF extends Mesh {

    private uriGLTF: string;

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.uriGLTF = this.uriGLTF;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      const loader: GLTFLoader = await GLTFLoader.LOAD(_serialization.uriGLTF);
      await this.load(loader, loader.gltf.meshes.findIndex(gltfMesh => gltfMesh.name == this.name));
      return this;
    }

    public async load(_loader: GLTFLoader, _iMesh: number): Promise<MeshGLTF> {
      const gltfMesh: GLTF.Mesh = _loader.gltf.meshes[_iMesh];
      this.name = gltfMesh.name;
      this.ƒindices = await _loader.getUint16Array(gltfMesh.primitives[0].indices);
      this.ƒvertices = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.POSITION);
      this.ƒnormalsVertex = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.NORMAL);
      this.ƒtextureUVs = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.TEXCOORD_0);
      this.uriGLTF = _loader.uri;
      return this;
    }
    
  }
}