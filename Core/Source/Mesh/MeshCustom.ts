namespace FudgeCore {
  export class MeshCustom extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCube);

    private baseMesh: Mesh;
   
    public constructor(_name: string = "MeshCustom", _baseMesh: Mesh) {
      super(_name);
      this.baseMesh = _baseMesh;
      this.create();
    }

    protected createVertices(): Float32Array {
      return this.baseMesh.vertices;
    }
    protected createTextureUVs(): Float32Array {
      return this.baseMesh.textureUVs;
    }
    protected createIndices(): Uint16Array {
      return this.baseMesh.indices;
    }
    protected createFaceNormals(): Float32Array {
      return this.baseMesh.normalsFace;
    }
  }
}