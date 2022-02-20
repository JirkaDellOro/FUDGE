namespace FudgeCore {
  export class Vertices extends Array<Vertex> {

    public position(_index: number): Vector3 {
      let vertex: Vertex = this[_index];
      return (vertex.referTo == undefined) ? vertex.position : this[vertex.referTo].position;
    }
  }
}