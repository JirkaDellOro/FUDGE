namespace FudgeCore {
  export class MeshGLTF extends Mesh {
    
    constructor(_gltfMesh?: GLTF.Mesh, _loader?: GLTFLoader) {
      super(_gltfMesh?.name);

      this.ƒindices = _loader?.getUint16Array(_gltfMesh.primitives[0].indices);
      this.ƒvertices = _loader?.getFloat32Array(_gltfMesh.primitives[0].attributes.POSITION);
      this.ƒnormals = _loader?.getFloat32Array(_gltfMesh.primitives[0].attributes.NORMAL);
      this.ƒtextureUVs = _loader?.getFloat32Array(_gltfMesh.primitives[0].attributes.TEXCOORD_0);
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      return this;
    }
    
  }
}