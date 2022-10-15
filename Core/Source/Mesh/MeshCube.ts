namespace FudgeCore {
  /**
   * Generate a simple cube with edges of length 1, each face consisting of two trigons
   * ```plaintext
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
      // this.create();
      this.vertices = new Vertices(
        // front
        new Vertex(new Vector3(-0.5, 0.5, 0.5), new Vector2(0, 0)), // 0
        new Vertex(new Vector3(-0.5, -0.5, 0.5), new Vector2(0, 1)), // 1
        new Vertex(new Vector3(0.5, -0.5, 0.5), new Vector2(1, 1)), // 2
        new Vertex(new Vector3(0.5, 0.5, 0.5), new Vector2(1, 0)), // 3
        // back
        new Vertex(new Vector3(-0.5, 0.5, -0.5), new Vector2(3, 0)), // 4
        new Vertex(new Vector3(-0.5, -0.5, -0.5), new Vector2(3, 1)), // 5
        new Vertex(new Vector3(0.5, -0.5, -0.5), new Vector2(2, 1)), // 6
        new Vertex(new Vector3(0.5, 0.5, -0.5), new Vector2(2, 0)), // 7
        // references
        new Vertex(0, new Vector2(4, 0)), // 8
        new Vertex(1, new Vector2(4, 1)), // 9
        new Vertex(3, new Vector2(0, 1)), // 10
        new Vertex(7, new Vector2(1, 1)), // 11
        new Vertex(4, new Vector2(1, 0)), // 12
        new Vertex(2, new Vector2(0, 0)), // 13
        new Vertex(6, new Vector2(1, 0)), // 14
        new Vertex(5, new Vector2(1, 1))  // 15
      );

      this.faces = [
        ...new Quad(this.vertices, 0, 1, 2, 3).faces, // front
        ...new Quad(this.vertices, 7, 6, 5, 4).faces, // back
        ...new Quad(this.vertices, 3, 2, 6, 7).faces, // right
        ...new Quad(this.vertices, 4, 5, 9, 8).faces, // left
        ...new Quad(this.vertices, 0, 10, 11, 12).faces, // top
        ...new Quad(this.vertices, 13, 1, 15, 14).faces  // bottom
      ];
    }
  }
}