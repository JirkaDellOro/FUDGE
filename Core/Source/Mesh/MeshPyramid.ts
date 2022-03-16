namespace FudgeCore {
  /**
   * Generate a simple pyramid with edges at the base of length 1 and a height of 1. The sides consisting of one, the base of two trigons
   * ```plaintext
   *               4
   *              /\`.
   *            3/__\_\ 2
   *           0/____\/1
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class MeshPyramid extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshPyramid);

    public constructor(_name: string = "MeshPyramid") {
      super(_name);
      // this.create();

      this.vertices = new Vertices(
        // ground vertices
        new Vertex(new Vector3(-0.5, 0.0, 0.5), new Vector2(0, 1)),
        new Vertex(new Vector3(0.5, 0.0, 0.5), new Vector2(1, 1)),
        new Vertex(new Vector3(0.5, 0.0, -0.5), new Vector2(1, 0)),
        new Vertex(new Vector3(-0.5, 0.0, -0.5), new Vector2(0, 0)),
        // tip (vertex #4)
        new Vertex(new Vector3(0.0, 1.0, 0.0), new Vector2(0.5, 0.5)),
        // floor again for downside texture
        new Vertex(0, new Vector2(0, 0)),
        new Vertex(1, new Vector2(1, 0)),
        new Vertex(2, new Vector2(1, 1)),
        new Vertex(3, new Vector2(0, 1))
      );
      this.faces = [
        new Face(this.vertices, 4, 0, 1),
        new Face(this.vertices, 4, 1, 2),
        new Face(this.vertices, 4, 2, 3),
        new Face(this.vertices, 4, 3, 0),
        new Face(this.vertices, 5 + 0, 5 + 2, 5 + 1),
        new Face(this.vertices, 5 + 0, 5 + 3, 5 + 2)
      ];
    }
  }
}