// / <reference path="../Coat/Coat.ts"/>
namespace FudgeCore {

  /**
   * Interface to access data from a WebGl shaderprogram. 
   * This should always mirror the (static) interface of {@link Shader}. It exposes the static members of Shader in an instance-based way. e.g.:
   * ```typescript
   * let shader: ShaderInterface;
   * ```
   * can take values of type 
   * ```typescript
   * typeof Shader | ShaderInteface
   * ```
   */
  export interface ShaderInterface {
    define: string[];
    program: WebGLProgram;
    attributes: { [name: string]: number };
    uniforms: { [name: string]: WebGLUniformLocation };
    /** Returns the vertex shader source code for the render engine */
    getVertexShaderSource(): string;
    /** Returns the fragment shader source code for the render engine */
    getFragmentShaderSource(): string;
    /** @internal Injected by decorator. Used by the render system. */
    deleteProgram(this: ShaderInterface): void;
    /** @internal Injected by decorator. Used by the render system. */
    useProgram(this: ShaderInterface): void;
    /** @internal Injected by decorator. Used by the render system. */
    createProgram(this: ShaderInterface): void;
  }

  /**
   * Static superclass for the representation of WebGl shaderprograms. 
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  // TODO: define attribute/uniforms as layout and use those consistently in shaders
  @RenderInjectorShader.decorate
  export abstract class Shader {
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    public static readonly baseClass: typeof Shader = Shader;
    /** list of all the subclasses derived from this class, if they registered properly*/
    public static readonly subclasses: typeof Shader[] = [];

    public static define: string[];
    // public static vertexShaderSource: string;
    // public static fragmentShaderSource: string;

    public static program: WebGLProgram;
    public static attributes: { [name: string]: number };
    public static uniforms: { [name: string]: WebGLUniformLocation };

    /** The type of coat that can be used with this shader to create a material */
    public static getCoat(): typeof Coat { return CoatColored; }
    /** Returns the vertex shader source code for the render engine */
    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderUniversal.vert"], this.define);
    }
    /** Returns the fragment shader source code for the render engine */
    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderUniversal.frag"], this.define);
    }
    /** @internal Injected by {@link RenderInjectorShader}. Used by the render system. */
    public static deleteProgram(this: typeof Shader): void {/* injected by decorator */ }
    /** @internal Injected by {@link RenderInjectorShader}. Used by the render system. */
    public static useProgram(this: typeof Shader): void {/* injected by decorator */ }
    /** @internal Injected by {@link RenderInjectorShader}. Used by the render system. */ // TODO: maybe don't flag this as internal, so shaders can be precompiled in future FUDGE apps. Or create an API to precompile shaders, load textures etc.
    public static createProgram(this: typeof Shader): void {/* injected by decorator */ }

    protected static registerSubclass(_subclass: typeof Shader): number { return Shader.subclasses.push(_subclass) - 1; }

    // replace the mandatory header of the shader with itself plus the definitions given
    protected static insertDefines(_shader: string, _defines: string[]): string {
      if (!_defines)
        return _shader;

      let code: string = "#version 300 es\n";
      for (let define of _defines)
        code += `#define ${define}\n`;

      return _shader.replace("#version 300 es", code);
    }
  }
}