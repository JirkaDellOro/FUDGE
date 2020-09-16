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
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
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
         * Scales a given vector by a given scale without changing the original vector
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
        /**
         * The main Sketch that holds all info related to a whole sketch.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class Sketch {
            constructor() {
                this.objects = [];
            }
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
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchObject {
            constructor() {
                this.color = "black";
                this.path2D = new Path2D;
                this.selected = false;
            }
            /**
             * Static sorting method intended to be used as a parameter for array.sort().
             * @param _a First Sketch Object to sort
             * @param _b Second Sketch Object to sort
             * @returns >0 if a > b, =0 if a=b and <0 if a < b
             */
            static sort(_a, _b) {
                return _a.order - _b.order;
            }
            /**
             * The basic draw function. Stub because abstract
             * @param _crc The 2d canvas rendering context to draw on
             */
            draw(_crc) {
                //;
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
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchPath extends SketchTypes.SketchObject {
            constructor(_color, _lineColor, _lineWidth = 1, _name = "", _order = 0, _vertices = []) {
                super();
                this.closed = true;
                this.vertices = [];
                this.lineColor = "black";
                this.lineWidth = 1;
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
            addVertexAtPos(_vertex, _index = -1) {
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
                this.path2D = path;
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
         * @authors Lukas Scheuerle, HFU, 2019
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
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchVertex extends SketchTypes.SketchPoint {
            constructor(_x, _y, _parent = null) {
                super(_x, _y);
                // public parent: SketchPath;
                this.activated = false;
                // this.parent = _parent;
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
                if (this.activated && Fudge.VectorEditor.vectorEditor.tangentsActive) {
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
                if (_withTangent) {
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
var Fudge;
(function (Fudge) {
    /**
     * A namespace to put general utility functions.
     * @authors Lukas Scheuerle, HFU, 20191
     */
    let Utils;
    (function (Utils) {
        /**
         * Generates a random number between min and max.
         * @param _min the minimum the random number needs to be bigger than (including).
         * @param _max the maximum the random number can't exceed (excluding).
         */
        function RandomRange(_min, _max) {
            return Math.floor((Math.random() * (_max - _min)) + _min);
        }
        Utils.RandomRange = RandomRange;
        /**
         * Returns a new rgba color in string format.
         * @param _includeAlpha whether the color should have a random alpha value as well. if false, it will have an alpha value of 1. defaults to false
         */
        function RandomColor(_includeAlpha = false) {
            let c = "rgba(";
            c += RandomRange(0, 255) + ",";
            c += RandomRange(0, 255) + ",";
            c += RandomRange(0, 255) + ",";
            c += _includeAlpha ? RandomRange(0, 255) + ")" : "1)";
            return c;
        }
        Utils.RandomColor = RandomColor;
        // export function getCircularReplacer(): any {
        //   const seen: WeakSet<any> = new WeakSet();
        //   return (key: any, value: any) => {
        //     if (typeof value === "object" && value !== null) {
        //       if (seen.has(value)) {
        //         return;
        //       }
        //       seen.add(value);
        //     }
        //     return value;
        //   };
        // }
    })(Utils = Fudge.Utils || (Fudge.Utils = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let VectorEditor;
    (function (VectorEditor) {
        /**
         * The Editor of the Vector Editor.
         * This is where everything comes together and is administered that is part of the vector editor.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class Editor {
            constructor(_sketch = null) {
                this.selectedPaths = [];
                this.selectedPoints = [];
                this.scale = 1;
                this.showTangentsShortcut = { keys: [Fudge.KEY.ALT_LEFT] };
                this.quadraticShapesShortcut = { keys: [Fudge.KEY.SHIFT_LEFT] };
                this.tangentsActive = false;
                this.changeHistory = [];
                this.changeHistoryIndex = 0;
                /**
                 * Mousedown on canvas eventhandler.
                 * sends the event to the selected Tool.
                 */
                this.mousedown = (_event) => {
                    _event.preventDefault();
                    if (this.selectedTool)
                        this.selectedTool.mousedown(_event);
                    this.redrawAll();
                };
                /**
                 * Mouseup on canvas eventhandler.
                 * sends the event to the selected Tool.
                 */
                this.mouseup = (_event) => {
                    _event.preventDefault();
                    if (this.selectedTool)
                        this.selectedTool.mouseup(_event);
                    this.redrawAll();
                };
                /**
                 * Mousemove on canvas eventhandler.
                 * sends the event to the selected Tool.
                 */
                this.mousemove = (_event) => {
                    _event.preventDefault();
                    if (this.selectedTool)
                        this.selectedTool.mousemove(_event);
                    this.uiHandler.updateMousePosition(this.realPosToCanvasPos(new Fudge.Vector2(_event.clientX, _event.clientY)));
                    if (_event.buttons > 0 || _event.button > 0)
                        this.redrawAll();
                };
                /**
                 * Scrolling/Wheel Eventhandler. Zooms in/out by a Multiplier.
                 */
                this.scroll = (_event) => {
                    let scaleMutiplier = 0.9;
                    let newScale = this.scale;
                    _event.preventDefault();
                    if (_event.deltaY > 0) {
                        newScale = this.scale * scaleMutiplier;
                    }
                    else if (_event.deltaY < 0) {
                        newScale = this.scale / scaleMutiplier;
                    }
                    this.setScale(newScale, _event);
                    this.uiHandler.updateMousePosition(this.realPosToCanvasPos(new Fudge.Vector2(_event.clientX, _event.clientY)));
                };
                /**
                 * Handles keypresses and stores them in a list of currently pressed keys for easy access. Also activates tools or shortcuts it knows of.
                 */
                this.keydown = (_event) => {
                    // _event.preventDefault();
                    let key = Fudge.stringToKey(_event.code);
                    if (!Editor.isKeyPressed(key)) {
                        Editor.pressedKeys.push(key);
                    }
                    if (!this.tangentsActive && Editor.isShortcutPressed(this.showTangentsShortcut)) {
                        this.tangentsActive = true;
                        this.redrawAll();
                    }
                    for (let t of this.toolManager.tools) {
                        if (Editor.isShortcutPressed(t.shortcut)) {
                            this.selectedTool = t;
                            this.uiHandler.updateUI();
                        }
                    }
                };
                /**
                 * Handles key releases and removes them from the list of currently pressed keys.
                 */
                this.keyup = (_event) => {
                    // _event.preventDefault();
                    let key = Fudge.stringToKey(_event.code);
                    if (Editor.isKeyPressed(key)) {
                        Editor.pressedKeys.splice(Editor.pressedKeys.indexOf(key), 1);
                    }
                    if (this.tangentsActive && !Editor.isShortcutPressed(this.showTangentsShortcut)) {
                        this.tangentsActive = false;
                        //TODO: remove tangets from selected points
                        this.redrawAll();
                    }
                };
                /**
                 * copys selected paths into the computers clipboard.
                 */
                this.copy = (_e) => {
                    //TODO make this only copy selected paths, not everything.
                    _e.clipboardData.setData("text/plain", JSON.stringify(this.sketch.objects));
                    _e.preventDefault();
                };
                /**
                 * pastes whatever is in the users clipboard to the canvas.
                 */
                this.paste = (_event) => {
                    //TODO: make this actually work
                    let data = _event.clipboardData.getData("text/plain");
                    //TODO: check whether the copied data is actually a sketch object
                    console.log(data);
                    this.redrawAll();
                };
                if (_sketch)
                    this.sketch = _sketch;
                else
                    this.sketch = new Fudge.SketchTypes.Sketch();
                this.changeHistory.push(JSON.stringify(this.sketch));
                this.toolManager = new VectorEditor.ToolManager();
                this.selectedTool = this.toolManager.tools[0];
                this.uiHandler = new VectorEditor.UIHandler(this);
                this.canvas = document.getElementsByTagName("canvas")[0];
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.crc = this.canvas.getContext("2d");
                this.canvas.addEventListener("mousedown", this.mousedown);
                this.canvas.addEventListener("mouseup", this.mouseup);
                this.canvas.addEventListener("mousemove", this.mousemove);
                window.addEventListener("keydown", this.keydown);
                window.addEventListener("keyup", this.keyup);
                window.addEventListener("wheel", this.scroll);
                document.addEventListener("copy", this.copy);
                document.addEventListener("paste", this.paste);
                this.transformationPoint = new Fudge.Vector2(this.canvas.width / 2, this.canvas.height / 2);
                this.redrawAll();
            }
            /**
             * Check whether a KEY is in the pressedKeys list.
             * @param _key The key to check whether it has been pressed
             */
            static isKeyPressed(_key) {
                return Editor.pressedKeys.indexOf(_key) > -1;
            }
            /**
             * Checks whether all Keys in a given Shortcut are pressed.
             * @param _shortcut the shortcut to check if it is currently pressed
             */
            static isShortcutPressed(_shortcut) {
                //TODO
                return false;
            }
            /**
             * Sets the scale of the editor preview to the given amount. Can scale around a mouse position. Limits the scale to be between 0.1 and 10 inclusive
             * @param _scale the new scale to set the scale to.
             * @param _event the mouseevent that caused the rescale. if not null, it will try to scale at the mouse position. defaults to null
             */
            setScale(_scale, _event = null) {
                let newScale = +Math.max(0.1, Math.min(_scale, 10)).toFixed(2);
                if (_event) {
                    this.transformationPoint = new Fudge.Vector2(_event.clientX - (_event.clientX - this.transformationPoint.x) * newScale / this.scale, _event.clientY - (_event.clientY - this.transformationPoint.y) * newScale / this.scale);
                }
                this.scale = newScale;
                this.uiHandler.updateScale(this.scale);
                this.redrawAll();
            }
            /**
             * Selects a Tool from the Toolmanager based on its name.
             * @param _name name of the tool to select
             */
            selectTool(_name) {
                for (let t of this.toolManager.tools) {
                    if (t.name == _name) {
                        this.selectedTool = t;
                        this.uiHandler.updateUI();
                        return;
                    }
                }
            }
            /**
             * undoes the last action.
             */
            undo() {
                if (this.changeHistoryIndex <= 0)
                    return;
                this.changeHistoryIndex--;
                this.sketch = JSON.parse(this.changeHistory[this.changeHistoryIndex]);
            }
            /**
             * restores the last action that was undone
             */
            redo() {
                this.changeHistoryIndex++;
                if (this.changeHistoryIndex >= this.changeHistory.length)
                    this.changeHistoryIndex = this.changeHistory.length - 1;
                this.sketch = JSON.parse(this.changeHistory[this.changeHistoryIndex]);
            }
            /**
             * adds a new turnback point to the change history. removes all undone changes from the history.
             */
            saveToChangeHistory() {
                this.changeHistoryIndex++;
                if (this.changeHistoryIndex < this.changeHistory.length)
                    this.changeHistory.splice(this.changeHistoryIndex);
                this.changeHistory.push(JSON.stringify(this.sketch));
            }
            /**
             * Finds the object the mouse is hovering over. Checks points first, then paths.
             * @param _clientPos the position of the client
             * @returns the point the mouse is over or the path the mouse is over, in this order
             */
            getPathOrPointTheMouseIsOver(_clientPos) {
                let found;
                found = this.getPointAtPositionInGroup(this.selectedPoints, _clientPos);
                if (found)
                    return found;
                for (let path of this.selectedPaths) {
                    found = this.getPointAtPositionInGroup(path.vertices, _clientPos);
                    if (found)
                        return found;
                    if (this.crc.isPointInPath(path.path2D, _clientPos.x, _clientPos.y))
                        return path;
                }
                for (let path of this.sketch.objects) {
                    if (this.crc.isPointInPath(path.path2D, _clientPos.x, _clientPos.y))
                        return path;
                }
                return null;
            }
            /**
             * Checks a given list of points if and which point is under the given position.
             * @param _points the points to check through
             * @param _clientPos the position to check for
             */
            getPointAtPositionInGroup(_points, _clientPos) {
                for (let point of _points) {
                    if (this.crc.isPointInPath(point.path2D, _clientPos.x, _clientPos.y))
                        return point;
                }
                return null;
            }
            /**
             * Converts the given client position into the canvas position based on scale and transformation of the canvas.
             * @param _clientPos the client position to convert
             */
            realPosToCanvasPos(_clientPos) {
                return new Fudge.Vector2((_clientPos.x - this.transformationPoint.x) / this.scale, (_clientPos.y - this.transformationPoint.y) / this.scale);
            }
            /**
             * redraws all objects on the canvas, including all sketch objects, the additional displays of the selected tool as well as the transformation point indicating 0 0 on the canvas.
             */
            redrawAll() {
                // console.log("redraw");
                this.crc.resetTransform();
                this.crc.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.crc.translate(this.transformationPoint.x, this.transformationPoint.y);
                this.crc.scale(this.scale, this.scale);
                this.sketch.objects.sort(Fudge.SketchTypes.SketchObject.sort);
                for (let obj of this.sketch.objects) {
                    this.crc.globalAlpha = 1;
                    if (this.selectedPaths.length > 0 && !obj.selected) {
                        this.crc.globalAlpha = 0.5;
                    }
                    obj.draw(this.crc);
                }
                this.selectedTool.additionalDisplay(this.crc);
                let transformationPointPath = new Path2D();
                let lineLength = 10;
                transformationPointPath.moveTo(-lineLength / this.scale, 0);
                transformationPointPath.lineTo(lineLength / this.scale, 0);
                transformationPointPath.moveTo(0, -lineLength / this.scale);
                transformationPointPath.lineTo(0, lineLength / this.scale);
                this.crc.strokeStyle = "black";
                this.crc.lineWidth = 2 / this.scale;
                this.crc.stroke(transformationPointPath);
            }
            /**
             * Utility function that deselectes all points and paths.
             * Shortcut for calling both deselectAllPoints() and deselectAllPaths().
             */
            deselectAll() {
                this.deselectAllPaths();
                this.deselectAllPoints();
            }
            /**
             * Utility function that deselectes all points.
             */
            deselectAllPoints() {
                for (let p of this.selectedPoints) {
                    p.selected = false;
                }
                this.selectedPoints = [];
            }
            /**
             * Utility function that deselectes all paths.
             */
            deselectAllPaths() {
                for (let p of this.selectedPaths) {
                    p.selected = false;
                }
                this.selectedPaths = [];
            }
        }
        Editor.pressedKeys = [];
        VectorEditor.Editor = Editor;
        // initialising an example vector editor on the given page
        window.addEventListener("DOMContentLoaded", init);
        function init() {
            let sketch = createTestSketch();
            VectorEditor.vectorEditor = new Editor(sketch);
        }
        //creating a test sketch upon loading until the actual loading of a saved sketch is implemented
        function createTestSketch() {
            let sketch = new Fudge.SketchTypes.Sketch();
            let amountObjects = 3;
            let amountPoints = 3;
            for (let i = 0; i < amountObjects; i++) {
                let start = new Fudge.SketchTypes.SketchVertex(Fudge.Utils.RandomRange(-250, 250), Fudge.Utils.RandomRange(-250, 250));
                let path = new Fudge.SketchTypes.SketchPath(Fudge.Utils.RandomColor(), "black", 1, "path" + i, i, [start]);
                for (let k = 0; k < amountPoints - 1; k++) {
                    let newPoint = new Fudge.SketchTypes.SketchVertex(Fudge.Utils.RandomRange(-250, 250), Fudge.Utils.RandomRange(-250, 250));
                    path.addVertexAtPos(newPoint);
                }
                sketch.objects.push(path);
            }
            return sketch;
        }
    })(VectorEditor = Fudge.VectorEditor || (Fudge.VectorEditor = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let KEY;
    (function (KEY) {
        KEY["A"] = "KeyA";
        KEY["B"] = "KeyB";
        KEY["C"] = "KeyC";
        KEY["D"] = "KeyD";
        KEY["E"] = "KeyE";
        KEY["F"] = "KeyF";
        KEY["G"] = "KeyG";
        KEY["H"] = "KeyH";
        KEY["I"] = "KeyI";
        KEY["J"] = "KeyJ";
        KEY["K"] = "KeyK";
        KEY["L"] = "KeyL";
        KEY["M"] = "KeyM";
        KEY["N"] = "KeyN";
        KEY["O"] = "KeyO";
        KEY["P"] = "KeyP";
        KEY["Q"] = "KeyQ";
        KEY["R"] = "KeyR";
        KEY["S"] = "KeyS";
        KEY["T"] = "KeyT";
        KEY["U"] = "KeyU";
        KEY["V"] = "KeyV";
        KEY["W"] = "KeyW";
        KEY["X"] = "KeyX";
        KEY["Y"] = "KeyY";
        KEY["Z"] = "KeyZ";
        KEY["ESC"] = "Escape";
        KEY["ZERO"] = "Digit0";
        KEY["ONE"] = "Digit1";
        KEY["TWO"] = "Digit2";
        KEY["TRHEE"] = "Digit3";
        KEY["FOUR"] = "Digit4";
        KEY["FIVE"] = "Digit5";
        KEY["SIX"] = "Digit6";
        KEY["SEVEN"] = "Digit7";
        KEY["EIGHT"] = "Digit8";
        KEY["NINE"] = "Digit9";
        KEY["MINUS"] = "Minus";
        KEY["EQUAL"] = "Equal";
        KEY["BACKSPACE"] = "Backspace";
        KEY["TABULATOR"] = "Tab";
        KEY["BRACKET_LEFT"] = "BracketLeft";
        KEY["BRACKET_RIGHT"] = "BracketRight";
        KEY["ENTER"] = "Enter";
        KEY["CTRL_LEFT"] = "ControlLeft";
        KEY["SEMICOLON"] = "Semicolon";
        KEY["QUOTE"] = "Quote";
        KEY["BACK_QUOTE"] = "Backquote";
        KEY["SHIFT_LEFT"] = "ShiftLeft";
        KEY["BACKSLASH"] = "Backslash";
        KEY["COMMA"] = "Comma";
        KEY["PERIOD"] = "Period";
        KEY["SLASH"] = "Slash";
        KEY["SHIFT_RIGHT"] = "ShiftRight";
        KEY["NUMPAD_MULTIPLY"] = "NumpadMultiply";
        KEY["ALT_LEFT"] = "AltLeft";
        KEY["SPACE"] = "Space";
        KEY["CAPS_LOCK"] = "CapsLock";
        KEY["F1"] = "F1";
        KEY["F2"] = "F2";
        KEY["F3"] = "F3";
        KEY["F4"] = "F4";
        KEY["F5"] = "F5";
        KEY["F6"] = "F6";
        KEY["F7"] = "F7";
        KEY["F8"] = "F8";
        KEY["F9"] = "F9";
        KEY["F10"] = "F10";
        KEY["PAUSE"] = "Pause";
        KEY["SCROLL_LOCK"] = "ScrollLock";
        KEY["NUMPAD7"] = "Numpad7";
        KEY["NUMPAD8"] = "Numpad8";
        KEY["NUMPAD9"] = "Numpad9";
        KEY["NUMPAD_SUBTRACT"] = "NumpadSubtract";
        KEY["NUMPAD4"] = "Numpad4";
        KEY["NUMPAD5"] = "Numpad5";
        KEY["NUMPAD6"] = "Numpad6";
        KEY["NUMPAD_ADD"] = "NumpadAdd";
        KEY["NUMPAD1"] = "Numpad1";
        KEY["NUMPAD2"] = "Numpad2";
        KEY["NUMPAD3"] = "Numpad3";
        KEY["NUMPAD0"] = "Numpad0";
        KEY["NUMPAD_DECIMAL"] = "NumpadDecimal";
        KEY["PRINT_SCREEN"] = "PrintScreen";
        KEY["INTL_BACK_SLASH"] = "IntlBackSlash";
        KEY["F11"] = "F11";
        KEY["F12"] = "F12";
        KEY["NUMPAD_EQUAL"] = "NumpadEqual";
        KEY["F13"] = "F13";
        KEY["F14"] = "F14";
        KEY["F15"] = "F15";
        KEY["F16"] = "F16";
        KEY["F17"] = "F17";
        KEY["F18"] = "F18";
        KEY["F19"] = "F19";
        KEY["F20"] = "F20";
        KEY["F21"] = "F21";
        KEY["F22"] = "F22";
        KEY["F23"] = "F23";
        KEY["F24"] = "F24";
        KEY["KANA_MODE"] = "KanaMode";
        KEY["LANG2"] = "Lang2";
        KEY["LANG1"] = "Lang1";
        KEY["INTL_RO"] = "IntlRo";
        KEY["CONVERT"] = "Convert";
        KEY["NON_CONVERT"] = "NonConvert";
        KEY["INTL_YEN"] = "IntlYen";
        KEY["NUMPAD_COMMA"] = "NumpadComma";
        KEY["UNDO"] = "Undo";
        KEY["PASTE"] = "Paste";
        KEY["MEDIA_TRACK_PREVIOUS"] = "MediaTrackPrevious";
        KEY["CUT"] = "Cut";
        KEY["COPY"] = "Copy";
        KEY["MEDIA_TRACK_NEXT"] = "MediaTrackNext";
        KEY["NUMPAD_ENTER"] = "NumpadEnter";
        KEY["CTRL_RIGHT"] = "ControlRight";
        KEY["AUDIO_VOLUME_MUTE"] = "AudioVolumeMute";
        KEY["LAUNCH_APP2"] = "LaunchApp2";
        KEY["MEDIA_PLAY_PAUSE"] = "MediaPlayPause";
        KEY["MEDIA_STOP"] = "MediaStop";
        KEY["EJECT"] = "Eject";
        KEY["AUDIO_VOLUME_DOWN"] = "AudioVolumeDown";
        KEY["VOLUME_DOWN"] = "VolumeDown";
        KEY["AUDIO_VOLUME_UP"] = "AudioVolumeUp";
        KEY["VOLUME_UP"] = "VolumeUp";
        KEY["BROWSER_HOME"] = "BrowserHome";
        KEY["NUMPAD_DIVIDE"] = "NumpadDivide";
        KEY["ALT_RIGHT"] = "AltRight";
        KEY["HELP"] = "Help";
        KEY["NUM_LOCK"] = "NumLock";
        KEY["HOME"] = "Home";
        KEY["ARROW_UP"] = "ArrowUp";
        KEY["PAGE_UP"] = "PageUp";
        KEY["ARROW_RIGHT"] = "ArrowRight";
        KEY["END"] = "End";
        KEY["ARROW_DOWN"] = "ArrowDown";
        KEY["PAGE_DOWN"] = "PageDown";
        KEY["INSERT"] = "Insert";
        KEY["DELETE"] = "Delete";
        KEY["META_LEFT"] = "Meta_Left";
        KEY["OS_LEFT"] = "OSLeft";
        KEY["META_RIGHT"] = "MetaRight";
        KEY["OS_RIGHT"] = "OSRight";
        KEY["CONTEXT_MENU"] = "ContextMenu";
        KEY["POWER"] = "Power";
        KEY["BROWSER_SEARCH"] = "BrowserSearch";
        KEY["BROWSER_FAVORITES"] = "BrowserFavorites";
        KEY["BROWSER_REFRESH"] = "BrowserRefresh";
        KEY["BROWSER_STOP"] = "BrowserStop";
        KEY["BROWSER_FORWARD"] = "BrowserForward";
        KEY["BROWSER_BACK"] = "BrowserBack";
        KEY["LAUNCH_APP1"] = "LaunchApp1";
        KEY["LAUNCH_MAIL"] = "LaunchMail";
        KEY["LAUNCH_MEDIA_PLAYER"] = "LaunchMediaPlayer";
        //mac brings this buttton
        KEY["FN"] = "Fn";
        //Linux brings these
        KEY["AGAIN"] = "Again";
        KEY["PROPS"] = "Props";
        KEY["SELECT"] = "Select";
        KEY["OPEN"] = "Open";
        KEY["FIND"] = "Find";
        KEY["WAKE_UP"] = "WakeUp";
        KEY["NUMPAD_PARENT_LEFT"] = "NumpadParentLeft";
        KEY["NUMPAD_PARENT_RIGHT"] = "NumpadParentRight";
        //android
        KEY["SLEEP"] = "Sleep";
    })(KEY = Fudge.KEY || (Fudge.KEY = {}));
    function stringToKey(_s) {
        // let typedKeyString: keyof typeof KEY = _s as keyof typeof KEY;
        // return KEY[typedKeyString];
        // @ts-ignore: implicit any
        return KEY.S;
    }
    Fudge.stringToKey = stringToKey;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let VectorEditor;
    (function (VectorEditor) {
        class UIHandler {
            constructor(_editor) {
                this.setScale = () => {
                    let scale = Number(this.scaleInput.value);
                    if (scale)
                        this.editor.setScale(scale);
                    else
                        this.updateScale(this.editor.scale);
                };
                this.handleClickOnTool = (_event) => {
                    if (_event.target == this.toolBar)
                        return;
                    if (_event.target.classList.contains("selected"))
                        return;
                    console.log(_event.currentTarget);
                    this.editor.selectTool(_event.currentTarget.id);
                };
                this.editor = _editor;
                this.toolBar = document.getElementById("toolBar");
                this.subToolBar = document.getElementById("subToolBar");
                this.inspector = document.getElementById("inspector");
                this.infoBar = document.getElementById("infoBar");
                this.createUI();
            }
            updateUI() {
                //selection
                this.deselectAll();
                let div = document.getElementById(this.editor.selectedTool.name);
                div.classList.add("selected");
            }
            createUI() {
                //toolbar
                this.toolBar.innerHTML = "";
                for (let tool of this.editor.toolManager.tools) {
                    let div = document.createElement("div");
                    div.classList.add("outline", "tool");
                    div.id = tool.name;
                    let icon = document.createElement("img");
                    icon.src = tool.icon;
                    div.appendChild(icon);
                    div.addEventListener("click", this.handleClickOnTool);
                    this.toolBar.appendChild(div);
                }
                //infobar
                this.infoBar.innerHTML = "";
                let s = document.createElement("span");
                s.innerText = "Mouseposition: ";
                this.mousePositionSpan = document.createElement("span");
                this.mousePositionSpan.id = "mousePositionSpan";
                this.mousePositionSpan.innerText = "0 | 0";
                this.infoBar.appendChild(s);
                this.infoBar.appendChild(this.mousePositionSpan);
                s = document.createElement("span");
                s.innerText = ", Scale: ";
                this.scaleInput = document.createElement("input");
                this.scaleInput.id = "scaleInput";
                this.scaleInput.value = this.editor.scale.toString();
                this.infoBar.appendChild(s);
                this.infoBar.appendChild(this.scaleInput);
                this.scaleInput.addEventListener("change", this.setScale);
                this.updateUI();
            }
            deselectAll() {
                let divs = document.querySelectorAll(".selected");
                for (let div of divs) {
                    div.classList.remove("selected");
                }
            }
            updateMousePosition(_mousePos) {
                this.mousePositionSpan.innerText = `${_mousePos.x.toFixed(0)} | ${_mousePos.y.toFixed(0)}`;
            }
            updateScale(_scale = 1) {
                this.scaleInput.value = `${_scale}`;
            }
            updateSelectedObjectUI() {
                //
            }
            updateSelectedObject() {
                //
            }
        }
        VectorEditor.UIHandler = UIHandler;
    })(VectorEditor = Fudge.VectorEditor || (Fudge.VectorEditor = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let VectorEditor;
    (function (VectorEditor) {
        /**
         * Superclass for all Tools.
         * Not Abstract so it can implement the basic functionality of propagating its events to potential subtools as well as creating some default behaviour for all tools.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class Tool {
            constructor(_name) {
                this.name = _name;
            }
            /**
             * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools.
             * @param _event the mouseevent that got caught by the mousedown listener
             */
            mousedown(_event) {
                if (this.selectedSubTool)
                    this.selectedSubTool.mousedown(_event);
            }
            /**
             * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools.
             * @param _event the mouseevent that got caught by the mousemove listener
             */
            mousemove(_event) {
                if (this.selectedSubTool)
                    this.selectedSubTool.mousemove(_event);
            }
            /**
             * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools.
             * @param _event the mouseevent that got caught by the mouseup listener
             */
            mouseup(_event) {
                if (this.selectedSubTool)
                    this.selectedSubTool.mouseup(_event);
            }
            /**
             * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools.
             * @param _event the mouseevent that got caught by the wheel listener
             */
            mousescroll(_event) {
                if (this.selectedSubTool)
                    this.selectedSubTool.mousescroll(_event);
            }
            /**
             * Allows Editor and UIHandler to check if a tool should be usable in the current state.
             * true by default.
             * @returns true if the tool can be selected in the current state, false if it can't.
             */
            prequisitesFulfilled() {
                return true;
            }
            /**
             * Allows for the tool to draw additional things onto the canvas if needed. By default only porpagates that to the selected subtool.
             * @param _crc The 2d canvas rendering context to draw the additional display on
             */
            additionalDisplay(_crc) {
                if (this.selectedSubTool)
                    this.selectedSubTool.additionalDisplay(_crc);
            }
            /**
             * Allows for the addition of additional subtool menu options, like dropdowns or number inputs. no submenu by default.
             */
            addAdditonalSubmenuOptions() {
                return;
            }
            /**
             * Allows the tool to be stopped at any point to prevent possible execution.
             */
            exit() {
                if (this.selectedSubTool)
                    this.selectedSubTool.exit();
            }
        }
        VectorEditor.Tool = Tool;
    })(VectorEditor = Fudge.VectorEditor || (Fudge.VectorEditor = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let VectorEditor;
    (function (VectorEditor) {
        /**
         * manages all Tools. Has a static register for tools types to register in as well as a list of tools as an attribute.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class ToolManager {
            constructor() {
                this.tools = [];
                for (let t of ToolManager.toolTypes) {
                    this.tools.push(new t(""));
                }
            }
            /**
             * Allows a tool to register itself in the ToolManager to be added automatically to the Editors top level Tool list.
             * @param _tool the type of the tool to register in the tooltypes List
             */
            static registerTool(_tool) {
                return ToolManager.toolTypes.push(_tool);
            }
        }
        ToolManager.toolTypes = [];
        VectorEditor.ToolManager = ToolManager;
    })(VectorEditor = Fudge.VectorEditor || (Fudge.VectorEditor = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let VectorEditor;
    (function (VectorEditor) {
        /**
         * The tool to move selected objects. Not used by itself, only as a subtool.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class ToolMove extends VectorEditor.Tool {
            constructor() {
                super("Move");
                this.icon = "./images/move.svg";
            }
            /**
             * Saves the mouseposition as the new starting position
             * @param _event the mouse event caught by the mousedown listener
             */
            mousedown(_event) {
                this.previousPosition = new Fudge.Vector2(_event.clientX, _event.clientY);
            }
            /**
             * If left mouse button is pressed, moves everything selected by the difference between current mouse position and previous mouse position.
             * @param _event the mouseevent caught by the mousemove listener
             */
            mousemove(_event) {
                if (_event.buttons == 0)
                    return;
                let delta = new Fudge.Vector2(_event.clientX - this.previousPosition.x, _event.clientY - this.previousPosition.y);
                delta.scale(1 / VectorEditor.vectorEditor.scale);
                if (_event.buttons == 1) {
                    if (VectorEditor.vectorEditor.selectedPoints.length > 0) {
                        for (let p of VectorEditor.vectorEditor.selectedPoints) {
                            p.move(delta);
                        }
                    }
                    else if (VectorEditor.vectorEditor.selectedPaths.length > 0) {
                        for (let p of VectorEditor.vectorEditor.selectedPaths) {
                            p.move(delta);
                        }
                    }
                }
                else {
                    VectorEditor.vectorEditor.transformationPoint.add(delta);
                }
                this.previousPosition = new Fudge.Vector2(_event.clientX, _event.clientY);
            }
            /**
             * @returns true if something is selected
             */
            prequisitesFulfilled() {
                return VectorEditor.vectorEditor.selectedPaths.length > 0 || VectorEditor.vectorEditor.selectedPoints.length > 0;
            }
        }
        VectorEditor.ToolMove = ToolMove;
    })(VectorEditor = Fudge.VectorEditor || (Fudge.VectorEditor = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    let VectorEditor;
    (function (VectorEditor) {
        /**
         * Selection Tool. The most important tool to select things. Includes the move tool for convenience.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class ToolSelect extends VectorEditor.Tool {
            constructor() {
                super("Select");
                this.move = new VectorEditor.ToolMove();
                this.icon = "./images/cursor.svg";
            }
            /**
             * Checks what has been clicked on and selects/deselects accordingly. If nothing is clicked on, prepares the boxselection.
             * @param _event the mouse event caused by the mousedown eventlistener
             */
            mousedown(_event) {
                if (_event.buttons == 0)
                    return;
                this.moved = false;
                let selectedObject = VectorEditor.vectorEditor.getPathOrPointTheMouseIsOver(new Fudge.Vector2(_event.clientX, _event.clientY));
                if (selectedObject) {
                    if (VectorEditor.Editor.isShortcutPressed(this.multiSelectShortcut)) {
                        if (selectedObject instanceof Fudge.SketchTypes.SketchPath) {
                            let i = VectorEditor.vectorEditor.selectedPaths.indexOf(selectedObject);
                            if (i > -1) {
                                VectorEditor.vectorEditor.selectedPaths.splice(i, 1);
                            }
                            else {
                                VectorEditor.vectorEditor.selectedPaths.push(selectedObject);
                            }
                        }
                        else {
                            let i = VectorEditor.vectorEditor.selectedPoints.indexOf(selectedObject);
                            if (i > -1) {
                                VectorEditor.vectorEditor.selectedPoints.splice(i, 1);
                            }
                            else {
                                VectorEditor.vectorEditor.selectedPoints.push(selectedObject);
                            }
                        }
                    }
                    else {
                        if (selectedObject instanceof Fudge.SketchTypes.SketchPath) {
                            VectorEditor.vectorEditor.deselectAll();
                            VectorEditor.vectorEditor.selectedPaths.push(selectedObject);
                        }
                        else {
                            VectorEditor.vectorEditor.deselectAllPoints();
                            VectorEditor.vectorEditor.selectedPoints.push(selectedObject);
                        }
                        selectedObject.selected = true;
                    }
                }
                else {
                    this.boxSelect = true;
                    this.startPosition = VectorEditor.vectorEditor.realPosToCanvasPos(new Fudge.Vector2(_event.clientX, _event.clientY));
                    this.currentPosition = this.startPosition.copy;
                }
                this.move.mousedown(_event);
            }
            /**
             * Saves the position if the user is performing a box selection, otherwise propagates the event to the move tool.
             * @param _event the mouse event caused by the mousemove eventlistener
             */
            mousemove(_event) {
                this.moved = true;
                if (this.boxSelect) {
                    this.currentPosition = VectorEditor.vectorEditor.realPosToCanvasPos(new Fudge.Vector2(_event.clientX, _event.clientY));
                }
                else {
                    this.move.mousemove(_event);
                }
            }
            /**
             * deslects everything if the player was performing a boxselection without moving, otherwise selects everything inside the box selected.
             * @param _event the mouse event caused by the mouseup eventlistener
             */
            mouseup(_event) {
                if (!this.moved && this.boxSelect) {
                    VectorEditor.vectorEditor.deselectAll();
                    this.boxSelect = false;
                }
                if (!this.boxSelect) {
                    return;
                }
                //TODO implement box selection
                this.boxSelect = false;
            }
            /**
             * Draws a box on the canvas if the user is performing a boxselection.
             * @param _crc the canvas rendering context on which to draw the additional display things.
             */
            additionalDisplay(_crc) {
                if (!this.boxSelect)
                    return;
                let rect = new Path2D();
                rect.rect(this.startPosition.x, this.startPosition.y, this.currentPosition.x - this.startPosition.x, this.currentPosition.y - this.startPosition.y);
                _crc.lineWidth = 1 / VectorEditor.vectorEditor.scale;
                _crc.strokeStyle = "black";
                _crc.stroke(rect);
            }
        }
        // register tool in the ToolManager
        ToolSelect.iRegister = VectorEditor.ToolManager.registerTool(ToolSelect);
        VectorEditor.ToolSelect = ToolSelect;
    })(VectorEditor = Fudge.VectorEditor || (Fudge.VectorEditor = {}));
})(Fudge || (Fudge = {}));
//# sourceMappingURL=VectorEditor.js.map