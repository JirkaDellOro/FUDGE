///<reference path="RenderInjector.ts"/>
///<reference path="RenderInjectorShader.ts"/>
///<reference path="RenderInjectorCoat.ts"/>
///<reference path="RenderInjectorMesh.ts"/>
namespace FudgeCore {
  export interface BufferSpecification {
    size: number;   // The size of the datasample.
    dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
    normalize: boolean; // Flag to normalize the data.
    stride: number; // Number of indices that will be skipped each iteration.
    offset: number; // Index of the element to begin with.
  }
  // export interface RenderShader {
  //   // TODO: examine, if this should be injected in shader class via RenderInjector, as done with Coat
  //   program: WebGLProgram;
  //   attributes: { [name: string]: number };
  //   uniforms: { [name: string]: WebGLUniformLocation };
  // }

  export interface RenderBuffers {
    // TODO: examine, if this should be injected in mesh class via RenderInjector, as done with Coat
    vertices: WebGLBuffer;
    indices: WebGLBuffer;
    nIndices: number;
    textureUVs: WebGLBuffer;
    normalsFace: WebGLBuffer;
  }

  export interface RenderCoat {
    //TODO: examine, if it makes sense to store a vao for each Coat, even though e.g. color won't be stored anyway...
    //vao: WebGLVertexArrayObject;
    coat: Coat;
  }

  export interface RenderLights {
    [type: string]: Float32Array;
  }

  /**
   * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
   * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
   */
  export abstract class RenderOperator {
    protected static crc3: WebGL2RenderingContext;
    protected static renderShaderRayCast: RenderShader;
    private static rectViewport: Rectangle;

    /** 
     * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
     * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
     * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
     */
    public static setAttributeStructure(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
      RenderOperator.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
    }

    /**
    * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
    * @param _value // value to check against null
    * @param _message // optional, additional message for the exception
    */
    public static assert<T>(_value: T | null, _message: string = ""): T {
      if (_value === null)
        throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderOperator.crc3 ? RenderOperator.crc3.getError() : ""}`);
      return _value;
    }
    /**
     * Initializes offscreen-canvas, renderingcontext and hardware viewport.
     */
    public static initialize(_antialias: boolean = false, _alpha: boolean = true): void {
      let contextAttributes: WebGLContextAttributes = { alpha: _alpha, antialias: _antialias, premultipliedAlpha: false };
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      RenderOperator.crc3 = RenderOperator.assert<WebGL2RenderingContext>(
        canvas.getContext("webgl2", contextAttributes),
        "WebGL-context couldn't be created"
      );
      // Enable backface- and zBuffer-culling.
      RenderOperator.crc3.enable(WebGL2RenderingContext.CULL_FACE);
      RenderOperator.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      RenderOperator.crc3.enable(WebGL2RenderingContext.BLEND);
      RenderOperator.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
      RenderOperator.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
      // RenderOperator.crc3.enable(WebGL2RenderingContext.);
      // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
      RenderOperator.rectViewport = RenderOperator.getCanvasRect();

      // RenderOperator.renderShaderRayCast = RenderOperator.createProgram(ShaderRayCast);
    }

    /**
     * Return a reference to the offscreen-canvas
     */
    public static getCanvas(): HTMLCanvasElement {
      return <HTMLCanvasElement>RenderOperator.crc3.canvas; // TODO: enable OffscreenCanvas
    }
    /**
     * Return a reference to the rendering context
     */
    public static getRenderingContext(): WebGL2RenderingContext {
      return RenderOperator.crc3;
    }
    /**
     * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
     */
    public static getCanvasRect(): Rectangle {
      let canvas: HTMLCanvasElement = <HTMLCanvasElement>RenderOperator.crc3.canvas;
      return Rectangle.GET(0, 0, canvas.width, canvas.height);
    }
    /**
     * Set the size of the offscreen-canvas.
     */
    public static setCanvasSize(_width: number, _height: number): void {
      RenderOperator.crc3.canvas.width = _width;
      RenderOperator.crc3.canvas.height = _height;
    }
    /**
     * Set the area on the offscreen-canvas to render the camera image to.
     * @param _rect
     */
    public static setViewportRectangle(_rect: Rectangle): void {
      Object.assign(RenderOperator.rectViewport, _rect);
      RenderOperator.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
    }
    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getViewportRectangle(): Rectangle {
      return RenderOperator.rectViewport;
    }

    /**
     * Convert light data to flat arrays
     * TODO: this method appears to be obsolete...?
     */
    protected static createRenderLights(_lights: MapLightTypeToLightList): RenderLights {
      let renderLights: RenderLights = {};
      for (let entry of _lights) {
        // TODO: simplyfy, since direction is now handled by ComponentLight
        switch (entry[0]) {
          case LightAmbient:
            let ambient: number[] = [];
            for (let cmpLight of entry[1]) {
              let c: Color = cmpLight.light.color;
              ambient.push(c.r, c.g, c.b, c.a);
            }
            renderLights["u_ambient"] = new Float32Array(ambient);
            break;
          case LightDirectional:
            let directional: number[] = [];
            for (let cmpLight of entry[1]) {
              let c: Color = cmpLight.light.color;
              // let d: Vector3 = (<LightDirectional>light.getLight()).direction;
              directional.push(c.r, c.g, c.b, c.a, 0, 0, 1);
            }
            renderLights["u_directional"] = new Float32Array(directional);
            break;
          default:
            Debug.warn("Shaderstructure undefined for", entry[0]);
        }
      }
      return renderLights;
    }

    /**
     * Set light data in shaders
     */
    protected static setLightsInShader(_renderShader: RenderShader, _lights: MapLightTypeToLightList): void {
      RenderOperator.useProgram(_renderShader);
      let uni: { [name: string]: WebGLUniformLocation } = _renderShader.uniforms;

      let ambient: WebGLUniformLocation = uni["u_ambient.color"];
      if (ambient) {
        let cmpLights: ComponentLight[] = _lights.get(LightAmbient);
        if (cmpLights) {
          // TODO: add up ambient lights to a single color
          let result: Color = new Color(0, 0, 0, 1);
          for (let cmpLight of cmpLights)
            result.add(cmpLight.light.color);
          RenderOperator.crc3.uniform4fv(ambient, result.getArray());
        }
      }

      let nDirectional: WebGLUniformLocation = uni["u_nLightsDirectional"];
      if (nDirectional) {
        let cmpLights: ComponentLight[] = _lights.get(LightDirectional);
        if (cmpLights) {
          let n: number = cmpLights.length;
          RenderOperator.crc3.uniform1ui(nDirectional, n);
          for (let i: number = 0; i < n; i++) {
            let cmpLight: ComponentLight = cmpLights[i];
            RenderOperator.crc3.uniform4fv(uni[`u_directional[${i}].color`], cmpLight.light.color.getArray());
            let direction: Vector3 = Vector3.Z();
            direction.transform(cmpLight.pivot);
            direction.transform(cmpLight.getContainer().mtxWorld);
            RenderOperator.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
          }
        }
      }
      // debugger;
    }

    /**
     * Draw a mesh buffer using the given infos and the complete projection matrix
     */
    protected static draw(_renderShader: typeof Shader, _mesh: Mesh, _coat: Coat, _world: Matrix4x4, _projection: Matrix4x4): void {
      // RenderOperator.useProgram(_renderShader);
      _renderShader.useProgram();
      _mesh.useRenderBuffers(_renderShader, _world, _projection);
      _coat.useRenderData(_renderShader);
      RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    }

    // #region Shaderprogram 
    protected static createProgram(_shaderClass: typeof Shader): RenderShader {
      let crc3: WebGL2RenderingContext = RenderOperator.crc3;
      let program: WebGLProgram = crc3.createProgram();
      let renderShader: RenderShader;
      try {
        crc3.attachShader(program, RenderOperator.assert<WebGLShader>(compileShader(_shaderClass.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
        crc3.attachShader(program, RenderOperator.assert<WebGLShader>(compileShader(_shaderClass.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
        crc3.linkProgram(program);
        let error: string = RenderOperator.assert<string>(crc3.getProgramInfoLog(program));
        if (error !== "") {
          throw new Error("Error linking Shader: " + error);
        }
        renderShader = {
          program: program,
          attributes: detectAttributes(),
          uniforms: detectUniforms()
        };
      } catch (_error) {
        Debug.error(_error);
        debugger;
      }
      return renderShader;


      function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
        let webGLShader: WebGLShader = crc3.createShader(_shaderType);
        crc3.shaderSource(webGLShader, _shaderCode);
        crc3.compileShader(webGLShader);
        let error: string = RenderOperator.assert<string>(crc3.getShaderInfoLog(webGLShader));
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
          let attributeInfo: WebGLActiveInfo = RenderOperator.assert<WebGLActiveInfo>(crc3.getActiveAttrib(program, i));
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
          let info: WebGLActiveInfo = RenderOperator.assert<WebGLActiveInfo>(crc3.getActiveUniform(program, i));
          if (!info) {
            break;
          }
          detectedUniforms[info.name] = RenderOperator.assert<WebGLUniformLocation>(crc3.getUniformLocation(program, info.name));
        }
        return detectedUniforms;
      }
    }
    protected static useProgram(_shaderInfo: RenderShader): void {
      RenderOperator.crc3.useProgram(_shaderInfo.program);
      RenderOperator.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
    }
    protected static deleteProgram(_program: RenderShader): void {
      if (_program) {
        RenderOperator.crc3.deleteProgram(_program.program);
        delete _program.attributes;
        delete _program.uniforms;
      }
    }
    // #endregion
  }
}