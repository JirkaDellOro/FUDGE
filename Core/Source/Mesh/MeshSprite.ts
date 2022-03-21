namespace FudgeCore {
  /**
   * Generate two quads placed back to back, the one facing in negative Z-direction is textured reversed
   * ```plaintext
   *        0 __ 3
   *         |__|
   *        1    2             
   * ``` 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class MeshSprite extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshSprite);

    public constructor(_name: string = "MeshSprite") {
      super(_name);
      this.vertices = new Vertices(
        new Vertex(new Vector3(-0.5, 0.5, 0), new Vector2(0, 0)),
        new Vertex(new Vector3(-0.5, -0.5, 0), new Vector2(0, 1)),
        new Vertex(new Vector3(0.5, -0.5, 0), new Vector2(1, 1)),
        new Vertex(new Vector3(0.5, 0.5, 0), new Vector2(1, 0))
      );
      this.faces = [
        new Face(this.vertices, 1, 2, 0),
        new Face(this.vertices, 2, 3, 0),
        new Face(this.vertices, 0, 3, 1),
        new Face(this.vertices, 3, 2, 1)
      ];
    }

    // flat is standard here
    public get verticesFlat(): Float32Array { return this.renderMesh.vertices; }
    public get indicesFlat(): Uint16Array { return this.renderMesh.indices; }

    // instead, smooth shading would need extra attention but is not relevant...

  }
}