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
      this.vertices = new Float32Array(json.vertices);
      this.indices = new Uint16Array(json.indices);
      this.textureUVs = new Float32Array(json.textureCoordinates);
      this.normalsFace = new Float32Array(json.normals);
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