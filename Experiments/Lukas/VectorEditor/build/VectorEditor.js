"use strict";
var Fudge;
(function (Fudge) {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class Vector2 {
        constructor(_x = 0, _y = 0) {
            this.data = new Float32Array([_x, _y]);
        }
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static get ZERO() {
            let vector = new Vector2();
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, 1)`.
         * @returns A new vector with the values (0, 1)
         */
        static get UP() {
            let vector = new Vector2(0, 1);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, -1)`.
         * @returns A new vector with the values (0, -1)
         */
        static get DOWN() {
            let vector = new Vector2(0, -1);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(1, 0)`.
         * @returns A new vector with the values (1, 0)
         */
        static get RIGHT() {
            let vector = new Vector2(1, 0);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(-1, 0)`.
         * @returns A new vector with the values (-1, 0)
         */
        static get LEFT() {
            let vector = new Vector2(-1, 0);
            return vector;
        }
        /**
         * Scales a given vector by a given scale
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector2.ZERO;
            try {
                let [x, y] = _vector.data;
                let factor = _length / Math.hypot(x, y);
                vector.data = new Float32Array([_vector.x * factor, _vector.y * factor]);
            }
            catch (_e) {
                console.warn(_e);
            }
            return vector;
        }
        /**
         * Scales a given vector by a given scale
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static SCALE(_vector, _scale) {
            let vector = new Vector2();
            return vector;
        }
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors) {
            let result = new Vector2();
            for (let vector of _vectors)
                result.data = new Float32Array([result.x + vector.x, result.y + vector.y]);
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a, _b) {
            let vector = new Vector2;
            vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y]);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y;
            return scalarProduct;
        }
        /**
         * Returns the magnitude of a given vector.
         * If you only need to compare magnitudes of different vectors, you can compare squared magnitudes using Vector2.MAGNITUDESQR instead.
         * @see Vector2.MAGNITUDESQR
         * @param _vector The vector to get the magnitude of.
         * @returns A number representing the magnitude of the given vector.
         */
        static MAGNITUDE(_vector) {
            let magnitude = Math.sqrt(Vector2.MAGNITUDESQR(_vector));
            return magnitude;
        }
        /**
         * Returns the squared magnitude of a given vector. Much less calculation intensive than Vector2.MAGNITUDE, should be used instead if possible.
         * @param _vector The vector to get the squared magnitude of.
         * @returns A number representing the squared magnitude of the given vector.
         */
        static MAGNITUDESQR(_vector) {
            let magnitude = Vector2.DOT(_vector, _vector);
            return magnitude;
        }
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSSPRODUCT(_a, _b) {
            let crossProduct = _a.x * _b.y - _a.y * _b.x;
            return crossProduct;
        }
        /**
         * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
         * ```plaintext
         *    ^                |
         *    |  =>  <--  =>   v  =>  -->
         * ```
         * @param _vector Vector to get the orthogonal equivalent of
         * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
         * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.
         */
        static ORTHOGONAL(_vector, _clockwise = false) {
            if (_clockwise)
                return new Vector2(_vector.y, -_vector.x);
            else
                return new Vector2(-_vector.y, _vector.x);
        }
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend) {
            this.data = new Vector2(_addend.x + this.x, _addend.y + this.y).data;
        }
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend) {
            this.data = new Vector2(this.x - _subtrahend.x, this.y - _subtrahend.y).data;
        }
        /**
         * Scales the Vector by the _scale.
         * @param _scale The scale to multiply the vector with.
         */
        scale(_scale) {
            this.data = new Vector2(_scale * this.x, _scale * this.y).data;
        }
        /**
         * Normalizes the vector.
         * @param _length A modificator to get a different length of normalized vector.
         */
        normalize(_length = 1) {
            this.data = Vector2.NORMALIZATION(this, _length).data;
        }
        /**
         * Sets the Vector to the given parameters. Ommitted parameters default to 0.
         * @param _x new x to set
         * @param _y new y to set
         */
        set(_x = 0, _y = 0) {
            this.data = new Float32Array([_x, _y]);
        }
        /**
         * Checks whether the given Vector is equal to the executed Vector.
         * @param _vector The vector to comapre with.
         * @returns true if the two vectors are equal, otherwise false
         */
        equals(_vector) {
            if (this.data[0] == _vector.data[0] && this.data[1] == _vector.data[1])
                return true;
            return false;
        }
        /**
         * @returns An array of the data of the vector
         */
        get() {
            return new Float32Array(this.data);
        }
        /**
         * @returns An deep copy of the vector.
         */
        get copy() {
            return new Vector2(this.x, this.y);
        }
    }
    Fudge.Vector2 = Vector2;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let SketchTypes;
    (function (SketchTypes) {
        class Sketch {
        }
        SketchTypes.Sketch = Sketch;
    })(SketchTypes = Fudge.SketchTypes || (Fudge.SketchTypes = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let SketchTypes;
    (function (SketchTypes) {
        /**
         * The basic Sketch Object that all drawable objects are made of.
         */
        class SketchObject {
            constructor() {
                this.color = "black";
                this.path2D = new Path2D;
            }
            static sort(_a, _b) {
                return _a.order - _b.order;
            }
        }
        SketchTypes.SketchObject = SketchObject;
    })(SketchTypes = Fudge.SketchTypes || (Fudge.SketchTypes = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let SketchTypes;
    (function (SketchTypes) {
        /**
         * The basic path object. Currently the thing that makes up all visual sketch objects
         */
        class SketchPath extends SketchTypes.SketchObject {
            constructor() {
                super(...arguments);
                this.closed = true;
                this.vertices = [];
                this.lineColor = "black";
                this.selected = false;
            }
            /**
             * (Re-)Generates the Path2D component of a point.
             */
            generatePath2D() {
                this.path2D = new Path2D();
                if (this.vertices.length < 1)
                    return;
                this.path2D.moveTo(this.vertices[0].x, this.vertices[0].y);
                for (let i = 1; i < this.vertices.length; i++) {
                    this.path2D.bezierCurveTo(this.vertices[i - 1].tangentOut.x, this.vertices[i - 1].tangentOut.y, this.vertices[i].tangentIn.x, this.vertices[i].tangentIn.y, this.vertices[i].x, this.vertices[i].y);
                }
                if (this.closed) {
                    this.path2D.bezierCurveTo(this.vertices[this.vertices.length - 1].tangentOut.x, this.vertices[this.vertices.length - 1].tangentOut.y, this.vertices[0].tangentIn.x, this.vertices[0].tangentIn.y, this.vertices[0].x, this.vertices[0].y);
                    this.path2D.closePath();
                }
            }
            /**
             * Draws the path onto the given context.
             * @param _context The context on which to draw the path on.
             */
            draw(_context) {
                this.generatePath2D();
                _context.fillStyle = this.color;
                _context.fill(this.path2D);
                _context.strokeStyle = this.lineColor;
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
            addVertexAtPos(_vertex, _index = -1) {
                _vertex.parent = this;
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
            move(_delta) {
                for (let vertex of this.vertices) {
                    vertex.move(_delta);
                }
            }
        }
        SketchTypes.SketchPath = SketchPath;
    })(SketchTypes = Fudge.SketchTypes || (Fudge.SketchTypes = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let SketchTypes;
    (function (SketchTypes) {
        /**
         * Base class for single points in the Editor.
         * Visually represented by a circle by default.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchPoint extends Fudge.Vector2 {
            /**
             * Draws the point on the given context at its position.
             * @param _context The rendering context to draw on
             * @param _selected Whether the point is currently selected. Fills the point if it is.
             */
            draw(_context) {
                this.generatePath2D();
                _context.strokeStyle = "black";
                _context.lineWidth = 1;
                _context.fillStyle = "black";
                _context.stroke(this.path2D);
                if (this.selected)
                    _context.fill(this.path2D);
            }
            /**
             * (Re-)Generates the Path2D component of a point.
             * It describes a circle.
             * @param _radius Sets the radius to use. Defaults to 5.
             */
            generatePath2D(_radius = 5) {
                let path = new Path2D();
                path.arc(this.x, this.y, _radius, 0, 2 * Math.PI);
                return path;
            }
            /**
             * Moves the point by the given value.
             * @param _delta the vector that desribes the difference in position
             */
            move(_delta) {
                this.x += _delta.x;
                this.y += _delta.y;
            }
            /**
             * Moves the point to the given position.
             * @param _newPos the vector that describes the new position the point should be moved to.
             */
            moveTo(_newPos) {
                this.x = _newPos.x;
                this.y = _newPos.y;
            }
        }
        SketchTypes.SketchPoint = SketchPoint;
    })(SketchTypes = Fudge.SketchTypes || (Fudge.SketchTypes = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let SketchTypes;
    (function (SketchTypes) {
        /**
         * Describes the Tangent Point used to draw the Bezier Curve between two SketchVertices.
         */
        class SketchTangentPoint extends SketchTypes.SketchPoint {
            /**
             * (Re-)Generates the Path2D component of a point.
             * It describes a square.
             * @param _sideLength Sets the side length to use. Defaults to 10.
             */
            generatePath2D(_sideLength = 10) {
                let path = new Path2D();
                path.rect(this.x - _sideLength / 2, this.y - _sideLength / 2, _sideLength, _sideLength);
                return path;
            }
        }
        SketchTypes.SketchTangentPoint = SketchTangentPoint;
    })(SketchTypes = Fudge.SketchTypes || (Fudge.SketchTypes = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let SketchTypes;
    (function (SketchTypes) {
        /**
         * Describes the corners of a SketchPath object.
         */
        class SketchVertex extends SketchTypes.SketchPoint {
            constructor(_x, _y, _parent) {
                super(_x, _y);
                this.activated = false;
                this.parent = _parent;
                this.tangentIn = new SketchTypes.SketchTangentPoint(_x, _y);
                this.tangentOut = new SketchTypes.SketchTangentPoint(_x, _y);
            }
            /**
             * Activates the Vertex to add tangent points to allow for line manipulation.
             */
            activate() {
                //TODO: create/move the Tangent Points
                this.activated = true;
            }
            /**
             * Deactivates the Vertex and removes the tangent points.
             */
            deactivate() {
                //TODO: handle the tangent points
                this.activated = false;
            }
            /**
             * Draws the Vertex.
             * @param _context The context to draw on
             */
            draw(_context) {
                super.draw(_context);
                if (this.activated) {
                    this.tangentIn.draw(_context);
                    this.tangentOut.draw(_context);
                }
            }
            /**
             * Moves the vertex by the given Value
             * @param _delta The change in position
             * @param _withTangent Whether the tangent points should be moved in the same way. Defaults to true.
             */
            move(_delta, _withTangent = true) {
                super.move(_delta);
                if (_withTangent && this.activated) {
                    this.tangentIn.move(_delta);
                    this.tangentOut.move(_delta);
                }
            }
        }
        SketchTypes.SketchVertex = SketchVertex;
    })(SketchTypes = Fudge.SketchTypes || (Fudge.SketchTypes = {}));
})(Fudge || (Fudge = {}));
var FUDGE;
(function (FUDGE) {
    class UIButton extends HTMLButtonElement {
        constructor(_functionToCall, _name, _hover, _help, _extendedHelp) {
            super();
            this.name = _name;
            this.hover = _hover;
            this.help = _help;
            this.extendedHelp = _extendedHelp;
            this.functionToCall = _functionToCall;
            this.addEventListener("click", this.functionToCall);
        }
    }
    FUDGE.UIButton = UIButton;
})(FUDGE || (FUDGE = {}));
//# sourceMappingURL=VectorEditor.js.map