namespace FudgeCore {
  export class Vertices extends Array<Vertex> {
    /**
     * returns the position associated with the vertex addressed, resolving references between vertices 
     */
    public position(_index: number): Vector3 {
      let vertex: Vertex = this[_index];
      return (vertex.referTo == undefined) ? vertex.position : this[vertex.referTo].position;
    }
    
    /**
     * returns the normal associated with the vertex addressed, resolving references between vertices 
     */
    public normal(_index: number): Vector3 {
      let vertex: Vertex = this[_index];
      return (vertex.referTo == undefined) ? vertex.normal : this[vertex.referTo].normal;
    }

    /**
     * returns the uv-coordinates associated with the vertex addressed
     */
    public uv(_index: number): Vector2 {
      return this[_index].uv;
    }
  }
}