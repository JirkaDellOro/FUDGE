namespace FudgeCore {
  /**
   * Array with extended functionality to serve as a {@link Vertex}-cloud. 
   * Accessors yield position or normal also for vertices referencing other vertices
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   */
  export class Vertices extends Array<Vertex> {
    // TODO: this class may become more powerful by hiding the array and add more service methods like calculating bounding box, radius etc.
    // see if a proxy of the array interfacing [] would do a good job
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