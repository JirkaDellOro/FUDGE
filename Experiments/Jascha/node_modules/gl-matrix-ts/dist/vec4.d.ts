import { mat4type, quattype, vec4type } from "./common";
export declare type valueType = vec4type;
/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
export declare function create(): Float32Array;
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
export declare function clone(a: vec4type): Float32Array;
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
export declare function fromValues(x: number, y: number, z: number, w: number): Float32Array;
/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
export declare function copy(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
export declare function set(out: vec4type, x: number, y: number, z: number, w: number): number[] | Float32Array;
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
export declare function add(out: vec4type, a: vec4type, b: vec4type): number[] | Float32Array;
/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
export declare function subtract(out: vec4type, a: vec4type, b: vec4type): number[] | Float32Array;
/**
 * Alias for {@link vec4.subtract}
 * @function
 */
export { subtract as sub };
/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
export declare function multiply(out: vec4type, a: vec4type, b: vec4type): number[] | Float32Array;
/**
 * Alias for {@link vec4.multiply}
 * @function
 */
export { multiply as mul };
/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
export declare function divide(out: vec4type, a: vec4type, b: vec4type): number[] | Float32Array;
/**
 * Alias for {@link vec4.divide}
 * @function
 */
export { divide as div };
/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to ceil
 * @returns {vec4} out
 */
export declare function ceil(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to floor
 * @returns {vec4} out
 */
export declare function floor(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
export declare function min(out: vec4type, a: vec4type, b: vec4type): number[] | Float32Array;
/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
export declare function max(out: vec4type, a: vec4type, b: vec4type): number[] | Float32Array;
/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to round
 * @returns {vec4} out
 */
export declare function round(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
export declare function scale(out: vec4type, a: vec4type, b: number): number[] | Float32Array;
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} s the amount to scale b by before adding
 * @returns {vec4} out
 */
export declare function scaleAndAdd(out: vec4type, a: vec4type, b: vec4type, s: number): number[] | Float32Array;
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
export declare function distance(a: vec4type, b: vec4type): number;
/**
 * Alias for {@link vec4.distance}
 * @function
 */
export { distance as dist };
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
export declare function squaredDistance(a: vec4type, b: vec4type): number;
/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
export { squaredDistance as sqrDist };
/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
export declare function length(a: vec4type): number;
/**
 * Alias for {@link vec4.length}
 * @function
 */
export { length as len };
/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export declare function squaredLength(a: vec4type): number;
/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
export { squaredLength as sqrLen };
/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
export declare function negate(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
export declare function inverse(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
export declare function normalize(out: vec4type, a: vec4type): number[] | Float32Array;
/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
export declare function dot(a: vec4type, b: vec4type): number;
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
export declare function lerp(out: vec4type, a: vec4type, b: vec4type, t: number): number[] | Float32Array;
/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [s] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
export declare function random(out: vec4type, s?: number): number[] | Float32Array;
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
export declare function transformMat4(out: vec4type, a: vec4type, m: mat4type): number[] | Float32Array;
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
export declare function transformQuat(out: vec4type, a: vec4type, q: quattype): number[] | Float32Array;
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
export declare function forEach(a: vec4type, stride: number, offset: number, count: number, fn: (out: vec4type, vec: vec4type, arg: any) => void, arg?: any): number[] | Float32Array;
/**
 * Returns a string representation of a vector
 *
 * @param {vec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
export declare function str(a: vec4type): string;
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export declare function exactEquals(a: vec4type, b: vec4type): boolean;
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
export declare function equals(a: vec4type, b: vec4type): boolean;
