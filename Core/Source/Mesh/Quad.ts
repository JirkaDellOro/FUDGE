namespace FudgeCore {
  export class Quad {
    public faces: Face[];

    constructor(_vertices: Vertices, _index0: number, _index1: number, _index2: number, _index3: number, _planar: boolean = true) {
      this.faces = [];
      try {
        this.faces.push(new Face(_vertices, _index0, _index1, _index2));
      }
      catch (_e: unknown) {
        Debug.fudge("Face excluded", (<Error>_e).message);
      }
      try {
        if (_planar)
          this.faces.push(new Face(_vertices, _index3, _index0, _index2));
        else
          this.faces.push(new Face(_vertices, _index0, _index2, _index3));
      }
      catch (_e: unknown) {
        Debug.fudge("Face excluded", (<Error>_e).message);
      }
    }
  }
}