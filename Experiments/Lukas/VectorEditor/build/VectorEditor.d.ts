declare namespace Fudge {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class Vector2 {
        private data;
        constructor(_x?: number, _y?: number);
        x: number;
        y: number;
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static readonly ZERO: Vector2;
        /**
         * A shorthand for writing `new Vector2(0, 1)`.
         * @returns A new vector with the values (0, 1)
         */
        static readonly UP: Vector2;
        /**
         * A shorthand for writing `new Vector2(0, -1)`.
         * @returns A new vector with the values (0, -1)
         */
        static readonly DOWN: Vector2;
        /**
         * A shorthand for writing `new Vector2(1, 0)`.
         * @returns A new vector with the values (1, 0)
         */
        static readonly RIGHT: Vector2;
        /**
         * A shorthand for writing `new Vector2(-1, 0)`.
         * @returns A new vector with the values (-1, 0)
         */
        static readonly LEFT: Vector2;
        /**
         * Scales a given vector by a given scale
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static NORMALIZATION(_vector: Vector2, _length?: number): Vector2;
        /**
         * Scales a given vector by a given scale
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static SCALE(_vector: Vector2, _scale: number): Vector2;
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors: Vector2[]): Vector2;
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a: Vector2, _b: Vector2): Vector2;
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a: Vector2, _b: Vector2): number;
        /**
         * Returns the magnitude of a given vector.
         * If you only need to compare magnitudes of different vectors, you can compare squared magnitudes using Vector2.MAGNITUDESQR instead.
         * @see Vector2.MAGNITUDESQR
         * @param _vector The vector to get the magnitude of.
         * @returns A number representing the magnitude of the given vector.
         */
        static MAGNITUDE(_vector: Vector2): number;
        /**
         * Returns the squared magnitude of a given vector. Much less calculation intensive than Vector2.MAGNITUDE, should be used instead if possible.
         * @param _vector The vector to get the squared magnitude of.
         * @returns A number representing the squared magnitude of the given vector.
         */
        static MAGNITUDESQR(_vector: Vector2): number;
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSSPRODUCT(_a: Vector2, _b: Vector2): number;
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
        static ORTHOGONAL(_vector: Vector2, _clockwise?: boolean): Vector2;
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend: Vector2): void;
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend: Vector2): void;
        /**
         * Scales the Vector by the _scale.
         * @param _scale The scale to multiply the vector with.
         */
        scale(_scale: number): void;
        /**
         * Normalizes the vector.
         * @param _length A modificator to get a different length of normalized vector.
         */
        normalize(_length?: number): void;
        /**
         * Sets the Vector to the given parameters. Ommitted parameters default to 0.
         * @param _x new x to set
         * @param _y new y to set
         */
        set(_x?: number, _y?: number): void;
        /**
         * Checks whether the given Vector is equal to the executed Vector.
         * @param _vector The vector to comapre with.
         * @returns true if the two vectors are equal, otherwise false
         */
        equals(_vector: Vector2): boolean;
        /**
         * @returns An array of the data of the vector
         */
        get(): Float32Array;
        /**
         * @returns An deep copy of the vector.
         */
        readonly copy: Vector2;
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        class Sketch {
            objects: SketchObject[];
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * The basic Sketch Object that all drawable objects are made of.
         */
        class SketchObject {
            order: number;
            color: string | CanvasGradient | CanvasPattern;
            name: string;
            path2D: Path2D;
            static sort(_a: SketchObject, _b: SketchObject): number;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * The basic path object. Currently the thing that makes up all visual sketch objects
         */
        class SketchPath extends SketchObject {
            closed: boolean;
            vertices: SketchVertex[];
            lineColor: string | CanvasGradient | CanvasPattern;
            selected: boolean;
            /**
             * (Re-)Generates the Path2D component of a point.
             */
            generatePath2D(): void;
            /**
             * Draws the path onto the given context.
             * @param _context The context on which to draw the path on.
             */
            draw(_context: CanvasRenderingContext2D): void;
            /**
             * Adds the given vertex to the path.
             * @param _vertex The vertex to add.
             * @param _index The zero-based index at which to insert the vertex. Can be negative to indicate counting from the back. Defaults to -1.
             */
            addVertexAtPos(_vertex: SketchVertex, _index?: number): void;
            /**
             * Moves the whole path object in the given direction.
             * @param _delta The change in position.
             */
            move(_delta: Vector2): void;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * Base class for single points in the Editor.
         * Visually represented by a circle by default.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchPoint extends Fudge.Vector2 {
            selected: boolean;
            protected path2D: Path2D;
            /**
             * Draws the point on the given context at its position.
             * @param _context The rendering context to draw on
             * @param _selected Whether the point is currently selected. Fills the point if it is.
             */
            draw(_context: CanvasRenderingContext2D): void;
            /**
             * (Re-)Generates the Path2D component of a point.
             * It describes a circle.
             * @param _radius Sets the radius to use. Defaults to 5.
             */
            generatePath2D(_radius?: number): Path2D;
            /**
             * Moves the point by the given value.
             * @param _delta the vector that desribes the difference in position
             */
            move(_delta: Vector2): void;
            /**
             * Moves the point to the given position.
             * @param _newPos the vector that describes the new position the point should be moved to.
             */
            moveTo(_newPos: Vector2): void;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * Describes the Tangent Point used to draw the Bezier Curve between two SketchVertices.
         */
        class SketchTangentPoint extends SketchPoint {
            parent: SketchVertex;
            /**
             * (Re-)Generates the Path2D component of a point.
             * It describes a square.
             * @param _sideLength Sets the side length to use. Defaults to 10.
             */
            generatePath2D(_sideLength?: number): Path2D;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * Describes the corners of a SketchPath object.
         */
        class SketchVertex extends SketchPoint {
            tangentIn: SketchTangentPoint;
            tangentOut: SketchTangentPoint;
            parent: SketchPath;
            private activated;
            constructor(_x: number, _y: number, _parent: SketchPath);
            /**
             * Activates the Vertex to add tangent points to allow for line manipulation.
             */
            activate(): void;
            /**
             * Deactivates the Vertex and removes the tangent points.
             */
            deactivate(): void;
            /**
             * Draws the Vertex.
             * @param _context The context to draw on
             */
            draw(_context: CanvasRenderingContext2D): void;
            /**
             * Moves the vertex by the given Value
             * @param _delta The change in position
             * @param _withTangent Whether the tangent points should be moved in the same way. Defaults to true.
             */
            move(_delta: Vector2, _withTangent?: boolean): void;
        }
    }
}
declare namespace FUDGE {
    class UIButton extends HTMLButtonElement implements UIElement {
        hover: string;
        help: string;
        extendedHelp: string;
        functionToCall: EventListener;
        constructor(_functionToCall: Function, _name: string, _hover: string, _help: string, _extendedHelp: string);
    }
}
declare namespace FUDGE {
    interface UIElement {
        name: string;
        hover: string;
        help: string;
        extendedHelp: string;
    }
}
