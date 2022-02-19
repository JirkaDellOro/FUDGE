namespace FudgeCore {
  export class Face {
    private vertices: Vertex[];
    public indices: number[] = [];
    public normalUnscaled: Vector3;
    public normal: Vector3;

    constructor(_vertices: Vertex[], _index0: number, _index1: number, _index2: number) {
      this.indices = [_index0, _index1, _index2];
      this.vertices = _vertices;
      this.calculateNormals();
    }

    public calculateNormals(): void {
      let trigon: Vector3[] = this.indices.map((_index: number) => this.vertices[_index].position);
      let v0: Vector3 = Vector3.DIFFERENCE(trigon[0], trigon[1]);
      let v1: Vector3 = Vector3.DIFFERENCE(trigon[0], trigon[2]);
      this.normalUnscaled = Vector3.CROSS(v0, v1);
      this.normal = Vector3.NORMALIZATION(this.normalUnscaled);
    }
  }
}