
enum defaultShaderType {
	FRAGMENT_SHADER = 35632,
	VERTEX_SHADER
};

console.log(defaultShaderType[0]);
console.log(defaultShaderType["FRAGMENT_SHADER"]);
// console.log(defaultShaderType[defaultShaderType[0].toString()]);


/**
 * Creates and compiles a shader.
 *
 * @param {!WebGL2RenderingContext} gl The WebGL2RenderingContext.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
export function compileShader(gl: WebGL2RenderingContext, shaderSource: string, shaderType: number): WebGLShader {
	// Create the shader object
	console.log(shaderType, gl.FRAGMENT_SHADER);
	var shader: WebGLShader = gl.createShader(shaderType);

	// Set the shader source code.
	gl.shaderSource(shader, shaderSource);

	// Compile the shader
	gl.compileShader(shader);

	// Check if it compiled
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		// Something went wrong during compilation; get the error
		throw "could not compile shader:" + gl.getShaderInfoLog(shader);
	}

	return shader;
}



/**
 * Creates a program from 2 shaders.
 *
 * @param {!WebGL2RenderingContext} gl The WebGL2RenderingContext.
 * @param {!WebGLShader} vertexShader A vertex shader.
 * @param {!WebGLShader} fragmentShader A fragment shader.
 * @return {!WebGLProgram} A program.
 */
export function createProgram(gl: WebGL2RenderingContext, shader: WebGLShader[]) {
	// create a program.
	var program: WebGLProgram = gl.createProgram();

	// attach the shaders.
	for (let i = 0; i < shader.length; i++)
		gl.attachShader(program, shader[i]);

	// link the program.
	gl.linkProgram(program);

	// Check if it linked.
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		// something went wrong with the link
		throw ("program filed to link:" + gl.getProgramInfoLog(program));
	}

	return program;
}

/**
* Creates a program from 2 sources.
*
* @param {WebGL2RenderingContext} gl The WebGL2RenderingContext
*        to use.
* @param {string[]} shaderSourcess Array of sources for the
*        shaders. The first is assumed to be the vertex shader,
*        the second the fragment shader.
* @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
* @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
* @return {WebGLProgram} The created program.
* @memberOf module:webgl-utils
*/
export function createProgramFromSources(gl: WebGL2RenderingContext, shaderSources: string[]) {
	var shaders: WebGLShader[] = [];
	for (let i: number = 0; i < shaderSources.length; i++) {
		console.log(i + gl.FRAGMENT_SHADER);
		shaders.push(compileShader(gl, shaderSources[i], i + gl.FRAGMENT_SHADER));
	}
	return createProgram(gl, shaders);
}
