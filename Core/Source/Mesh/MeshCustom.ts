namespace FudgeCore {
  export class MeshCustom extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCustom);   
    public constructor(_name: string = "MeshCustom") {
      super(_name);
    }

    public async load(_url: RequestInfo): Promise<void> {
      let path: URL = new URL(_url.toString(), Project.baseURL);
      const response: Response = await window.fetch(path.toString());
      const json = await response.json();
      this.ƒvertices = new Float32Array(json.vertices);
      this.ƒindices = new Uint16Array(json.indices);
      this.ƒtextureUVs = new Float32Array(json.textureCoordinates);
      this.ƒnormalsFace = new Float32Array(json.normals);
      this.createRenderBuffers();
    }

    protected createVertices(): Float32Array {
      return this.vertices;
    }

    protected createTextureUVs(): Float32Array {
      return this.textureUVs;
    }
    
    protected createIndices(): Uint16Array {
      return this.indices;
    }
    protected createFaceNormals(): Float32Array {
      return this.normalsFace;
    }
  }
}