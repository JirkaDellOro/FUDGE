namespace FudgeCore {
  /**
   * Describes a face of a {@link Mesh} by referencing three {@link Vertices} with their indizes
   * and calculates face normals.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   */
  export class Face {
    public indices: number[] = [];
    public normalUnscaled: Vector3;
    public normal: Vector3;
    private vertices: Vertices;

    public constructor(_vertices: Vertices, _index0: number, _index1: number, _index2: number) {
      this.indices = [_index0, _index1, _index2];
      this.vertices = _vertices;
      this.calculateNormals();
    }

    public calculateNormals(): void {
      let trigon: Vector3[] = this.indices.map((_index: number) => this.vertices.position(_index));
      let v1: Vector3 = Vector3.DIFFERENCE(trigon[1], trigon[0]);
      let v2: Vector3 = Vector3.DIFFERENCE(trigon[2], trigon[0]);
      this.normalUnscaled = Vector3.CROSS(v1, v2);
      this.normal = Vector3.NORMALIZATION(this.normalUnscaled);
    }

    public getPosition(_index: number): Vector3 {
      return this.vertices.position(this.indices[_index]);
    }

    /**
     * must be coplanar
     */
    public isInside(_point: Vector3): boolean {
      let diffs: Vector3[] = [];
      for (let index of this.indices) {
        let diff: Vector3 = Vector3.DIFFERENCE(this.vertices.position(index), _point);
        diffs.push(diff);
      }
      let n0: Vector3 = Vector3.CROSS(diffs[1], diffs[0]);
      let n1: Vector3 = Vector3.CROSS(diffs[2], diffs[1]);
      let n2: Vector3 = Vector3.CROSS(diffs[0], diffs[2]);

      let dot1: number = Vector3.DOT(n0, n1);
      let dot2: number = Vector3.DOT(n0, n2);

      return !(dot1 < 0 || dot2 < 0);
    }
  }
}