namespace Fudge {
  export namespace SketchTypes {
    /**
     * The basic path object. Currently the thing that makes up all visual sketch objects
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class SketchPath extends SketchObject {
      closed: boolean = true;
      vertices: SketchVertex[] = [];
      lineColor: string | CanvasGradient | CanvasPattern = "black";
      lineWidth: number = 1;

      constructor(_color: string | CanvasGradient | CanvasPattern, _lineColor: string | CanvasGradient | CanvasPattern, _lineWidth: number = 1, _name: string = "", _order: number = 0, _vertices: SketchVertex[] = []) {
        super();
        this.color = _color;
        this.lineColor = _lineColor;
        this.lineWidth = _lineWidth;
        this.name = _name;
        this.order = _order;
        this.vertices = _vertices;
      }

      /**
       * (Re-)Generates the Path2D component of the whole path. 
       */
      generatePath2D(): void {
        this.path2D = new Path2D();
        if (this.vertices.length < 1) return;
        this.path2D.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i: number = 1; i < this.vertices.length; i++) {
          this.path2D.bezierCurveTo(
            this.vertices[i - 1].tangentOut.x, this.vertices[i - 1].tangentOut.y,
            this.vertices[i].tangentIn.x, this.vertices[i].tangentIn.y,
            this.vertices[i].x, this.vertices[i].y);
        }
        if (this.closed) {
          this.path2D.bezierCurveTo(
            this.vertices[this.vertices.length - 1].tangentOut.x, this.vertices[this.vertices.length - 1].tangentOut.y,
            this.vertices[0].tangentIn.x, this.vertices[0].tangentIn.y,
            this.vertices[0].x, this.vertices[0].y
          );
          this.path2D.closePath();
        }
      }

      /**
       * Draws the path onto the given context.
       * @param _context The context on which to draw the path on.
       */
      draw(_context: CanvasRenderingContext2D): void {
        this.generatePath2D();
        _context.fillStyle = this.color;
        _context.fill(this.path2D);
        _context.strokeStyle = this.lineColor;
        _context.lineWidth = this.lineWidth;
        _context.stroke(this.path2D);

        if (this.selected) {
          for (let point of this.vertices) {
            point.draw(_context);
          }
        }
      }

      /**
       * Adds the given vertex to the path.
       * @param _vertex The vertex to add.
       * @param _index The zero-based index at which to insert the vertex. Can be negative to indicate counting from the back. Defaults to -1.
       */
      addVertexAtPos(_vertex: SketchVertex, _index: number = -1): void {
        // _vertex.parent = this;
        if (_index < 0) {
          _index = this.vertices.length + _index;
        }
        if (_index < 0 || _index > this.vertices.length) {
          throw new RangeError();
        }
        this.vertices.splice(_index, 0, _vertex);
      }

      /**
       * Moves the whole path object in the given direction.
       * @param _delta The change in position.
       */
      move(_delta: Vector2): void {
        for (let vertex of this.vertices) {
          vertex.move(_delta);
        }
      }
    }
  }
}