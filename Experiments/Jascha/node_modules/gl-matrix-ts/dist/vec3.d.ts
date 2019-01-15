import { mat4type, quattype, vec3type } from "./common";
export declare type valueType = vec3type;
/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
export declare function create(): Float32Array;
/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
export declare function clone(a: vec3type): Float32Array;
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
export declare function fromValues(x: number, y: number, z: number): Float32Array;
/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
export declare function copy(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
export declare function set(out: vec3type, x: number, y: number, z: number): number[] | Float32Array;
/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function add(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function subtract(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Alias for {@link vec3.subtract}
 * @function
 */
export { subtract as sub };
/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function multiply(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Alias for {@link vec3.multiply}
 * @function
 */
export { multiply as mul };
/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function divide(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Alias for {@link vec3.divide}
 * @function
 */
export { divide as div };
/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
export declare function ceil(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
export declare function floor(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function min(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function max(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
export declare function round(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
export declare function scale(out: vec3type, a: vec3type, b: number): number[] | Float32Array;
/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} s the amount to scale b by before adding
 * @returns {vec3} out
 */
export declare function scaleAndAdd(out: vec3type, a: vec3type, b: vec3type, s: number): number[] | Float32Array;
/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
export declare function distance(a: vec3type, b: vec3type): number;
/**
 * Alias for {@link vec3.distance}
 * @function
 */
export { distance as dist };
/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
export declare function squaredDistance(a: vec3type, b: vec3type): number;
/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
export { squaredDistance as sqrDist };
/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
export declare function length(a: vec3type): number;
/**
 * Alias for {@link vec3.length}
 * @function
 */
export { length as len };
/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export declare function squaredLength(a: vec3type): number;
/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
export { squaredLength as sqrLen };
/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
export declare function negate(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
export declare function inverse(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
export declare function normalize(out: vec3type, a: vec3type): number[] | Float32Array;
/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
export declare function dot(a: vec3type, b: vec3type): number;
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
export declare function cross(out: vec3type, a: vec3type, b: vec3type): number[] | Float32Array;
/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
export declare function lerp(out: vec3type, a: vec3type, b: vec3type, t: number): number[] | Float32Array;
/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
export declare function hermite(out: vec3type, a: vec3type, b: vec3type, c: vec3type, d: vec3type, t: number): number[] | Float32Array;
/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
export declare function bezier(out: vec3type, a: vec3type, b: vec3type, c: vec3type, d: vec3type, t: number): number[] | Float32Array;
/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [s] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
export declare function random(out: vec3type, s?: number): number[] | Float32Array;
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
export declare function transformMat4(out: vec3type, a: vec3type, m: mat4type): number[] | Float32Array;
/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
export declare function transformMat3(out: vec3type, a: vec3type, m: mat4type): number[] | Float32Array;
/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
export declare function transformQuat(out: vec3type, a: vec3type, q: quattype): number[] | Float32Array;
/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
export declare function rotateX(out: vec3type, a: vec3type, b: vec3type, c: number): number[] | Float32Array;
/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
export declare function rotateY(out: vec3type, a: vec3type, b: vec3type, c: number): number[] | Float32Array;
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
export declare function rotateZ(out: vec3type, a: vec3type, b: vec3type, c: number): number[] | Float32Array;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
export declare function forEach(a: vec3type, stride: number, offset: number, count: number, fn: (out: vec3type, vec: vec3type, arg: any) => void, arg?: any): number[] | Float32Array;
/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
export declare function angle(a: vec3type, b: vec3type): number;
/**
 * Returns a string representation of a vector
 *
 * @param {vec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
export declare function str(a: vec3type): string;
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export declare function exactEquals(a: vec3type, b: vec3type): boolean;
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export declare function equals(a: vec3type, b: vec3type): boolean;
