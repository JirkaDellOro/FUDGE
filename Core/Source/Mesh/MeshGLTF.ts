namespace FudgeCore {
  /**
   * Mesh loaded from a GLTF-file
   * @author Matthias Roming, HFU, 2022
   */
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
      this.renderMesh = new RenderMesh(this);
      Reflect.set(this.renderMesh, "ƒindices", await _loader.getUint16Array(gltfMesh.primitives[0].indices));
      Reflect.set(this.renderMesh, "ƒvertices", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.POSITION));
      Reflect.set(this.renderMesh, "ƒnormalsVertex", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.NORMAL));
      Reflect.set(this.renderMesh, "ƒtextureUVs", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.TEXCOORD_0));
      this.createVerticesAndFaces();
      this.uriGLTF = _loader.uri;
      return this;
    }

    private createVerticesAndFaces(): void {
      for (let iVertexAndNormal: number = 0, iTextureUV: number = 0; iVertexAndNormal < this.renderMesh.vertices.length;
           iVertexAndNormal += 3, iTextureUV += 2) {
        this.vertices.push(new Vertex(
          new Vector3(
            this.renderMesh.vertices[iVertexAndNormal + 0],
            this.renderMesh.vertices[iVertexAndNormal + 1],
            this.renderMesh.vertices[iVertexAndNormal + 2]
          ),
          new Vector2(
            this.renderMesh.textureUVs[iTextureUV + 0],
            this.renderMesh.textureUVs[iTextureUV + 1]
          ),
          new Vector3(
            this.renderMesh.normalsVertex[iVertexAndNormal + 0],
            this.renderMesh.normalsVertex[iVertexAndNormal + 1],
            this.renderMesh.normalsVertex[iVertexAndNormal + 2]
          )
        ));
      }

      for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < this.renderMesh.indices.length; iFaceVertexIndex += 3) {
        this.faces.push(new Face(
          this.vertices,
          this.renderMesh.indices[iFaceVertexIndex + 0],
          this.renderMesh.indices[iFaceVertexIndex + 1],
          this.renderMesh.indices[iFaceVertexIndex + 2]
        ));
      }
    }
    
  }
}