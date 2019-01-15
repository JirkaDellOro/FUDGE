export declare const EPSILON = 0.000001;
export declare type vec2type = number[] | Float32Array;
export declare type mat2dtype = number[] | Float32Array;
export declare type vec3type = number[] | Float32Array;
export declare type vec4type = number[] | Float32Array;
export declare type mat3type = number[] | Float32Array;
export declare type mat4type = number[] | Float32Array;
export declare type quattype = number[] | Float32Array;
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */
export declare function toRadian(a: number): number;
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
export declare function equals(a: number, b: number): boolean;
