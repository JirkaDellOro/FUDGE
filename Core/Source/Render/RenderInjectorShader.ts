namespace FudgeCore {
   //gives WebGL Buffer the data from the {@link Shader}
  export class RenderInjectorShader {
    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor, "useProgram", {
        value: RenderInjectorShader.useProgram
      });
      Object.defineProperty(_constructor, "deleteProgram", {
        value: RenderInjectorShader.deleteProgram
      });
      Object.defineProperty(_constructor, "createProgram", {
        value: RenderInjectorShader.createProgram
      });
    }

    public static useProgram(this: typeof Shader): void {
      if (!this.program)
        this.createProgram();
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.useProgram(this.program);
      crc3.enableVertexAttribArray(this.attributes["a_position"]);
    }

    public static deleteProgram(this: typeof Shader): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.program) {
        crc3.deleteProgram(this.program);
        delete this.attributes;
        delete this.uniforms;
      }
    }

    protected static createProgram(this: typeof Shader): void {
      Debug.fudge("Create shader program", this.name);
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let program: WebGLProgram = crc3.createProgram();
      try {
        crc3.attachShader(program, RenderWebGL.assert<WebGLShader>(compileShader(this.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
        crc3.attachShader(program, RenderWebGL.assert<WebGLShader>(compileShader(this.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
        crc3.linkProgram(program);
        let error: string = RenderWebGL.assert<string>(crc3.getProgramInfoLog(program));
        if (error !== "") {
          throw new Error("Error linking Shader: " + error);
        }

        this.program = program;
        this.attributes = detectAttributes();
        this.uniforms = detectUniforms();

      } catch (_error) {
        Debug.error(_error);
        debugger;
      }


      function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
        let webGLShader: WebGLShader = crc3.createShader(_shaderType);
        crc3.shaderSource(webGLShader, _shaderCode);
        crc3.compileShader(webGLShader);
        let error: string = RenderWebGL.assert<string>(crc3.getShaderInfoLog(webGLShader));
        if (error !== "") {
          throw new Error("Error compiling shader: " + error);
        }
        // Check for any compilation errors.
        if (!crc3.getShaderParameter(webGLShader, WebGL2RenderingContext.COMPILE_STATUS)) {
          alert(crc3.getShaderInfoLog(webGLShader));
          return null;
        }
        return webGLShader;
      }
      function detectAttributes(): { [name: string]: number } {
        let detectedAttributes: { [name: string]: number } = {};
        let attributeCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
        for (let i: number = 0; i < attributeCount; i++) {
          let attributeInfo: WebGLActiveInfo = RenderWebGL.assert<WebGLActiveInfo>(crc3.getActiveAttrib(program, i));
          if (!attributeInfo) {
            break;
          }
          detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);
        }
        return detectedAttributes;
      }
      function detectUniforms(): { [name: string]: WebGLUniformLocation } {
        let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
        let uniformCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
        for (let i: number = 0; i < uniformCount; i++) {
          let info: WebGLActiveInfo = RenderWebGL.assert<WebGLActiveInfo>(crc3.getActiveUniform(program, i));
          if (!info) {
            break;
          }
          detectedUniforms[info.name] = RenderWebGL.assert<WebGLUniformLocation>(crc3.getUniformLocation(program, info.name));
        }
        return detectedUniforms;
      }
    }
  }
}