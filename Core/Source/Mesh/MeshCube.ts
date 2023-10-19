namespace FudgeCore {
  /**
   * Generate a simple cube with edges of length 1, each face consisting of two trigons
   * ```text
   *       (12) 4____7  (11)
   *       (8) 0/__3/| (10)
   *       (15) ||5_||6 (14)
   *       (9) 1|/_2|/ (13)
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class MeshCube extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCube);

    public constructor(_name: string = "MeshCube") {
      super(_name);

      // no shared vertices, corners need three normals for Phong and Gouraud
      this.vertices = new Vertices(
        // front vertices
        new Vertex(new Vector3(-0.5, 0.5, 0.5), new Vector2(0, 0)), // 0
        new Vertex(new Vector3(-0.5, -0.5, 0.5), new Vector2(0, 1)), // 1
        new Vertex(new Vector3(0.5, -0.5, 0.5), new Vector2(1, 1)), // 2
        new Vertex(new Vector3(0.5, 0.5, 0.5), new Vector2(1, 0)) //3
      );

      // generate vertices on sides
      for (let angle: number = 90; angle < 360; angle += 90) {
        let transform: Matrix4x4 = Matrix4x4.ROTATION(Vector3.Y(angle));
        let side: Vertex[] = this.vertices.slice(0, 4).map((_v: Vertex) =>
          new Vertex(Vector3.TRANSFORMATION(_v.position, transform), _v.uv));
        this.vertices.push(...side);
      }
      // generate vertices for top and bottom
      for (let angle: number = 90; angle < 360; angle += 180) {
        let transform: Matrix4x4 = Matrix4x4.ROTATION(Vector3.X(angle));
        let side: Vertex[] = this.vertices.slice(0, 4).map((_v: Vertex) =>
          new Vertex(Vector3.TRANSFORMATION(_v.position, transform), _v.uv));
        this.vertices.push(...side);
      }

      this.faces = [];
      for (let i: number = 0; i < 24; i += 4)
        // generate faces
        this.faces.push(...new Quad(this.vertices, i + 0, i + 1, i + 2, i + 3).faces);
    }
  }
}