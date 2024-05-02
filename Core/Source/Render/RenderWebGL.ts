///<reference path="RenderInjector.ts"/>
///<reference path="RenderInjectorShader.ts"/>
///<reference path="RenderInjectorCoat.ts"/>
///<reference path="RenderInjectorMesh.ts"/>
///<reference path="RenderInjectorShaderParticleSystem.ts"/>
///<reference path="RenderInjectorComponentParticleSystem.ts"/>
///<reference path="../Math/Rectangle.ts"/>

namespace FudgeCore {
  // export declare let fudgeConfig: General;

  export type RenderTexture = WebGLTexture;

  export enum BLEND {
    OPAQUE, TRANSPARENT, ADDITIVE, SUBTRACTIVE, MODULATE
  }

  // we want type inference here so we can use vs code to search for references
  export const UNIFORM_BLOCKS = { // eslint-disable-line
    LIGHTS: {
      NAME: "Lights",
      BINDING: 0
    },
    SKIN: {
      NAME: "Skin",
      BINDING: 1
    },
    FOG: {
      NAME: "Fog",
      BINDING: 2
    }
  };

  export const TEXTURE_LOCATION = { // eslint-disable-line
    COLOR: {
      UNIFORM: "u_texColor",
      UNIT: WebGL2RenderingContext.TEXTURE0,
      INDEX: 0 // could compute these by UNIT - WebGL2RenderingContext.TEXTURE0 
    },
    NORMAL: {
      UNIFORM: "u_texNormal",
      UNIT: WebGL2RenderingContext.TEXTURE1,
      INDEX: 1
    },
    PARTICLE: {
      UNIFORM: "u_particleSystemRandomNumbers",
      UNIT: WebGL2RenderingContext.TEXTURE2,
      INDEX: 2
    },
    TEXT: {
      UNIFORM: "u_texText", // TODO: add text uniform to shader...
      UNIT: WebGL2RenderingContext.TEXTURE3,
      INDEX: 3
    }
  } as const;

  /**
   * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
   * Methods and attributes of this class should not be called directly, only through {@link Render}
   */
  export abstract class RenderWebGL extends EventTargetStatic {
    public static uboLights: WebGLBuffer;
    public static uboLightsVariableOffsets: { [_name: string]: number }; // Maps the names of the variables inside the Lights uniform block to their respective byte offset

    protected static crc3: WebGL2RenderingContext = RenderWebGL.initialize();
    protected static ƒpicked: Pick[];

    private static rectRender: Rectangle = RenderWebGL.getCanvasRect();
    private static sizePick: number;

    private static fboMain: WebGLFramebuffer; // used for forward rendering passes, e.g. opaque and transparent objects
    private static fboPost: WebGLFramebuffer; // used for post-processing effects, attachments get swapped for different effects
    private static fboTarget: WebGLFramebuffer; // used to render the final image to, usually "null" to render to the canvas default framebuffer. Used by XR to render to the XRWebGLLayer framebuffer.

    private static texColor: WebGLTexture; // stores the color of each pixel rendered
    private static texPosition: WebGLTexture; // stores the position of each pixel in world space
    private static texNormal: WebGLTexture; // stores the normal of each pixel in world space
    private static texNoise: WebGLTexture; // stores random values for each pixel, used for ambient occlusion
    private static texDepthStencil: WebGLTexture; // stores the depth of each pixel, currently unused
    private static texBloomSamples: WebGLTexture[]; // stores down and upsampled versions of the color texture, used for bloom

    private static uboFog: WebGLBuffer; // stores the fog parameters

    /**
     * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
     */
    public static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext {
      let fudgeConfig: General = Reflect.get(globalThis, "fudgeConfig") || {};
      const antialias: boolean = (_antialias != undefined) ? _antialias : fudgeConfig.antialias || false;
      if (antialias)
        Debug.error("The default antialiasing is not compatible with the current post-processing effects and will therefore be disabled.");
      let contextAttributes: WebGLContextAttributes = { // TODO: 
        alpha: (_alpha != undefined) ? _alpha : fudgeConfig.alpha || false,
        antialias: false,
        premultipliedAlpha: false,
        stencil: true
      };
      Debug.fudge("Initialize RenderWebGL", contextAttributes);
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      let crc3: WebGL2RenderingContext;
      crc3 = RenderWebGL.assert<WebGL2RenderingContext>(
        canvas.getContext("webgl2", contextAttributes),
        "WebGL-context couldn't be created"
      );
      RenderWebGL.crc3 = crc3;
      // Enable backface- and zBuffer-culling.
      crc3.enable(WebGL2RenderingContext.CULL_FACE);
      crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      crc3.enable(WebGL2RenderingContext.BLEND);
      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
      RenderWebGL.rectRender = RenderWebGL.getCanvasRect();

      RenderWebGL.initializeAttachments();
      RenderWebGL.adjustAttachments();

      RenderWebGL.uboFog = RenderWebGL.assert(crc3.createBuffer());

      return crc3;
    }

    /**
    * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
    * @param _value  value to check against null
    * @param _message  optional, additional message for the exception
    */
    public static assert<T>(_value: T | null, _message: string = ""): T {
      if (_value === null)
        throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderWebGL.crc3 ? RenderWebGL.crc3.getError() : ""}`);
      return _value;
    }

    /**
     * Return a reference to the offscreen-canvas
     */
    public static getCanvas(): HTMLCanvasElement {
      return <HTMLCanvasElement>RenderWebGL.crc3.canvas; // TODO: enable OffscreenCanvas
    }

    /**
     * Return a reference to the rendering context
     */
    public static getRenderingContext(): WebGL2RenderingContext {
      return RenderWebGL.crc3;
    }

    /**
     * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
     */
    public static getCanvasRect(): Rectangle {
      let canvas: HTMLCanvasElement = <HTMLCanvasElement>RenderWebGL.crc3.canvas;
      return Rectangle.GET(0, 0, canvas.width, canvas.height);
    }

    /**
     * Set the size of the offscreen-canvas.
     */
    public static setCanvasSize(_width: number, _height: number): void {
      RenderWebGL.crc3.canvas.width = _width;
      RenderWebGL.crc3.canvas.height = _height;
    }

    /**
     * Set the area on the offscreen-canvas to render the camera image to.
     * @param _rect
     */
    public static setRenderRectangle(_rect: Rectangle): void {
      RenderWebGL.rectRender.setPositionAndSize(_rect.x, _rect.y, _rect.width, _rect.height);
      RenderWebGL.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
    }

    /**
     * Clear the offscreen renderbuffer with the given {@link Color}
     */
    public static clear(_color?: Color): void {
      RenderWebGL.crc3.clearColor(_color?.r ?? 0, _color?.g ?? 0, _color?.b ?? 0, _color?.a ?? 1);
      RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT | WebGL2RenderingContext.STENCIL_BUFFER_BIT);
    }

    /**
     * Set the final framebuffer to render to. If null, the canvas default framebuffer is used.
     * Used by XR to render to the XRWebGLLayer framebuffer.
     */
    public static setFramebufferTarget(_buffer: WebGLFramebuffer): void {
      RenderWebGL.fboTarget = _buffer;
    }

    /**
     * Reset the framebuffer to the main color buffer.
     */
    public static resetFramebuffer(): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
    }

    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getRenderRectangle(): Rectangle {
      return RenderWebGL.rectRender;
    }

    /**
     * Enable / Disable WebGLs depth test.
     */
    public static setDepthTest(_test: boolean): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
    }

    /**
     * Enable / Disable WebGLs scissor test.
     */
    public static setScissorTest(_test: boolean, _x?: number, _y?: number, _width?: number, _height?: number): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.SCISSOR_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.SCISSOR_TEST);
      RenderWebGL.crc3.scissor(_x, _y, _width, _height);
    }

    /**
     * Set WebGLs viewport.
     */
    public static setViewport(_x: number, _y: number, _width: number, _height: number): void {
      RenderWebGL.crc3.viewport(_x, _y, _width, _height);
    }

    /**
     * Set the blend mode to render with
     */
    public static setBlendMode(_mode: BLEND): void {
      // ⚠️ CAUTION: all blending is done with premultiplied alpha in the shader, so the blend functions are set accordingly
      switch (_mode) {
        case BLEND.OPAQUE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
          break;
        case BLEND.TRANSPARENT:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
          // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
          break;
        case BLEND.ADDITIVE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
          // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
        case BLEND.SUBTRACTIVE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
          // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
        case BLEND.MODULATE: // color gets multiplied, tried to copy unitys "Particle Shader: Blending Option: Rendering Mode: Modulate"
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
        default:
          break;
      }
    }

    /**
     * Read the (world) position from the pixel at the given point on the render-rectangle (origin top left).
     * ⚠️ CAUTION: Currently only works when ambient occlusion is active due to writing to the position texture being disabled otherwise.
     */
    public static pointRenderToWorld(_render: Vector2): Vector3 {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      const data: Float32Array = new Float32Array(4);
      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
      crc3.readBuffer(WebGL2RenderingContext.COLOR_ATTACHMENT1);
      crc3.readPixels(_render.x, RenderWebGL.rectRender.height - _render.y, 1, 1, crc3.RGBA, crc3.FLOAT, data);
      crc3.readBuffer(WebGL2RenderingContext.COLOR_ATTACHMENT0);
      let position: Vector3 = Recycler.get(Vector3);
      position.set(data[0], data[1], data[2]);
      return position;
    }

    /**
     * Initializes different framebuffers aswell as texture attachments to use as render targets
     */
    public static initializeAttachments(): void {
      RenderWebGL.crc3.getExtension("EXT_color_buffer_float"); // TODO: disable ssao if not supported

      RenderWebGL.fboMain = RenderWebGL.assert<WebGLFramebuffer>(RenderWebGL.crc3.createFramebuffer());
      RenderWebGL.fboPost = RenderWebGL.assert<WebGLFramebuffer>(RenderWebGL.crc3.createFramebuffer());
      RenderWebGL.fboTarget = null;

      RenderWebGL.texColor = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texPosition = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texNormal = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texDepthStencil = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texNoise = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);

      RenderWebGL.texBloomSamples = new Array(6);
      for (let i: number = 0; i < RenderWebGL.texBloomSamples.length; i++)
        RenderWebGL.texBloomSamples[i] = createTexture(WebGL2RenderingContext.LINEAR, WebGL2RenderingContext.CLAMP_TO_EDGE);

      function createTexture(_filter: number, _wrap: number): WebGLTexture {
        const crc3: WebGL2RenderingContext = RenderWebGL.crc3;
        const texture: WebGLTexture = RenderWebGL.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, _filter);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, _filter);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, _wrap);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, _wrap);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
        return texture;
      }
    }

    /**
     * Adjusts the size of the different texture attachments (render targets) to the canvas size
     * ⚠️ CAUTION: Expensive operation, use only when canvas size changed
     */
    public static adjustAttachments(): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      const width: number = crc3.canvas.width || 1;
      const height: number = crc3.canvas.height || 1;

      crc3.activeTexture(crc3.TEXTURE0);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texPosition);
      // In view space 16F would be precise enough... but we want to use world space for calculations
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA32F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.FLOAT, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texNormal);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA16F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.FLOAT, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texDepthStencil);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.DEPTH24_STENCIL8, width, height, 0, WebGL2RenderingContext.DEPTH_STENCIL, WebGL2RenderingContext.UNSIGNED_INT_24_8, null);

      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor, 0);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texPosition, 0);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT2, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texNormal, 0);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texDepthStencil, 0);
      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);

      for (let i: number = 0, divisor: number = 1; i < RenderWebGL.texBloomSamples.length; i++, divisor *= 2) {
        let width: number = Math.max(Math.round(crc3.canvas.width / divisor), 1);
        let height: number = Math.max(Math.round(crc3.canvas.height / divisor), 1);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i]);
        crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
      }

      const nValues: number = width * height * 4;
      const noiseData: Uint8Array = new Uint8Array(nValues);

      for (let i: number = 0; i < nValues; i += 4) {
        noiseData[i] = Math.floor(Math.random() * 256);
        noiseData[i + 1] = Math.floor(Math.random() * 256);
        noiseData[i + 2] = Math.floor(Math.random() * 256);
        noiseData[i + 3] = Math.floor(Math.random() * 256);
      }

      crc3.bindTexture(crc3.TEXTURE_2D, RenderWebGL.texNoise);
      crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, width, height, 0, crc3.RGBA, crc3.UNSIGNED_BYTE, noiseData);
      crc3.bindTexture(crc3.TEXTURE_2D, null);
    }

    //#region Picking
    /**
     * Creates a texture buffer to be used as pick-buffer
     */
    protected static createPickTexture(_size: number): RenderTexture {
      // create to render to
      const targetTexture: RenderTexture = RenderWebGL.assert(Render.crc3.createTexture());
      Render.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture); // TODO: check if superclass (RenderWebGL) should refer downwards to subclass (Render) like this

      {
        const internalFormat: number = WebGL2RenderingContext.RGBA32I;
        const format: number = WebGL2RenderingContext.RGBA_INTEGER;
        const type: number = WebGL2RenderingContext.INT;
        Render.pickBuffer = new Int32Array(_size * _size * 4);
        Render.crc3.texImage2D(
          WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, _size, _size, 0, format, type, Render.pickBuffer
        );

        // set the filtering so we don't need mips
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      }

      const framebuffer: WebGLFramebuffer = Render.crc3.createFramebuffer();
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
      const attachmentPoint: number = WebGL2RenderingContext.COLOR_ATTACHMENT0;
      Render.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, targetTexture, 0);

      RenderWebGL.sizePick = _size;
      return targetTexture;
    }

    protected static getPicks(_size: number, _cmpCamera: ComponentCamera): Pick[] {
      // evaluate texture by reading pixels and extract, convert and store the information about each mesh hit
      let data: Int32Array = new Int32Array(_size * _size * 4);
      Render.crc3.readPixels(0, 0, _size, _size, WebGL2RenderingContext.RGBA_INTEGER, WebGL2RenderingContext.INT, data);

      let mtxViewToWorld: Matrix4x4 = Matrix4x4.INVERSION(_cmpCamera.mtxWorldToView);
      let picked: Pick[] = [];
      for (let i: number = 0; i < Render.ƒpicked.length; i++) {
        let zBuffer: number = data[4 * i + 0] + data[4 * i + 1] / 256;
        if (zBuffer == 0) // discard misses 
          continue;
        let pick: Pick = Render.ƒpicked[i];
        pick.zBuffer = convertInt32toFloat32(data, 4 * i + 0) * 2 - 1;
        pick.color = convertInt32toColor(data, 4 * i + 1);
        pick.textureUV = Recycler.get(Vector2);
        pick.textureUV.set(convertInt32toFloat32(data, 4 * i + 2), convertInt32toFloat32(data, 4 * i + 3));
        pick.mtxViewToWorld = mtxViewToWorld;

        picked.push(pick);
      }

      return picked;

      function convertInt32toFloat32(_int32Array: Int32Array, _index: number): number {
        let buffer: ArrayBuffer = new ArrayBuffer(4);
        let view: DataView = new DataView(buffer);
        view.setInt32(0, _int32Array[_index]);
        return view.getFloat32(0);
      }

      function convertInt32toColor(_int32Array: Int32Array, _index: number): Color {
        let buffer: ArrayBuffer = new ArrayBuffer(4);
        let view: DataView = new DataView(buffer);
        view.setInt32(0, _int32Array[_index]);
        let color: Color = Color.CSS(`rgb(${view.getUint8(0)}, ${view.getUint8(1)}, ${view.getUint8(2)})`, view.getUint8(3) / 255);
        return color;
      }
    }

    /**
    * The render function for picking a single node. 
    * A cameraprojection with extremely narrow focus is used, so each pixel of the buffer would hold the same information from the node,  
    * but the fragment shader renders only 1 pixel for each node into the render buffer, 1st node to 1st pixel, 2nd node to second pixel etc.
    */
    protected static pick(_node: Node, _cmpCamera: ComponentCamera): void { // create Texture to render to, int-rgba
      try {
        let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
        let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
        let coat: Coat = cmpMaterial.material.coat;
        let shader: ShaderInterface = coat instanceof CoatTextured ? ShaderPickTextured : ShaderPick;

        shader.useProgram();
        coat.useRenderData(shader, cmpMaterial);
        let mtxMeshToView: Matrix4x4 = this.calcMeshToView(_node, cmpMesh.mtxWorld, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);

        let sizeUniformLocation: WebGLUniformLocation = shader.uniforms["u_vctSize"];
        RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);

        let mesh: Mesh = cmpMesh.mesh;
        let renderBuffers: RenderBuffers = mesh.useRenderBuffers(shader, _node.mtxWorld, mtxMeshToView, Render.ƒpicked.length);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        let pick: Pick = new Pick(_node);
        Render.ƒpicked.push(pick);
      } catch (_error) {
        //
      }
    }

    protected static pickGizmos(_gizmos: Gizmo[], _cmpCamera: ComponentCamera): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      // buffer these into both shaders as we don't know which one will be used for the gizmo
      let shader: ShaderInterface = ShaderPick;
      shader.useProgram();
      crc3.uniform2fv(shader.uniforms["u_vctSize"], [RenderWebGL.sizePick, RenderWebGL.sizePick]);
      shader = ShaderPickTextured;
      shader.useProgram();
      crc3.uniform2fv(shader.uniforms["u_vctSize"], [RenderWebGL.sizePick, RenderWebGL.sizePick]);
      crc3.uniformMatrix3fv(shader.uniforms["u_mtxPivot"], false, Matrix3x3.IDENTITY().get()); // only needed for textured pick shader, but gizmos have no pivot

      Gizmos.pick(_gizmos, _cmpCamera, Render.ƒpicked);
    }
    //#endregion

    /**
     * Buffer the fog parameters into the fog ubo
     */
    protected static bufferFog(_cmpFog: ComponentFog): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      const data: Float32Array = new Float32Array(8);

      data[0] = _cmpFog?.isActive ? 1 : 0;
      if (_cmpFog) {
        data[1] = _cmpFog.near;
        data[2] = _cmpFog.far;
        data.set(_cmpFog.color.getArray(), 4);
      }

      // buffer data to bound buffer
      crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, RenderWebGL.uboFog);
      crc3.bufferData(WebGL2RenderingContext.UNIFORM_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW);

      // bind buffer to binding point
      crc3.bindBufferBase(WebGL2RenderingContext.UNIFORM_BUFFER, UNIFORM_BLOCKS.FOG.BINDING, RenderWebGL.uboFog);
    }

    /**
     * Buffer the data from the lights in the scenegraph into the lights ubo
     */
    protected static bufferLights(_lights: MapLightTypeToLightList): void {
      if (!RenderWebGL.uboLights)
        return;

      RenderWebGL.crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, RenderWebGL.uboLights);

      // fill the buffer with the ambient light color
      let cmpLights: RecycableArray<ComponentLight> = _lights.get(LightAmbient);
      if (cmpLights) {
        let clrSum: Color = new Color(0, 0, 0, 0);
        for (let cmpLight of cmpLights)
          clrSum.add(cmpLight.light.color);

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets["u_ambient.vctColor"], // byte offset of the struct Light "u_ambient" inside the ubo
          new Float32Array(clrSum.getArray())
        );
      }

      // fill the buffer with the light data for each light type
      // we are currently doing a maximum of 4 crc3.bufferSubData() calls, but we could do this in one call
      bufferLightsOfType(LightDirectional, "u_nLightsDirectional", "u_directional");
      bufferLightsOfType(LightPoint, "u_nLightsPoint", "u_point");
      bufferLightsOfType(LightSpot, "u_nLightsSpot", "u_spot");

      function bufferLightsOfType(_type: TypeOfLight, _uniName: string, _uniStruct: string): void {
        const cmpLights: RecycableArray<ComponentLight> = _lights.get(_type);

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets[_uniName], // byte offset of the uint "u_nLightsDirectional" inside the ubo
          new Uint8Array([cmpLights?.length ?? 0])
        );

        if (!cmpLights)
          return;

        const lightDataSize: number = 4 + 16 + 16; // vctColor + mtxShape + mtxShapeInverse, as float32s
        const lightsData: Float32Array = new Float32Array(cmpLights.length * lightDataSize);

        let iLight: number = 0;
        for (let cmpLight of cmpLights) {
          const lightDataOffset: number = iLight * lightDataSize;

          // set vctColor
          lightsData.set(cmpLight.light.color.getArray(), lightDataOffset + 0);

          // set mtxShape
          let mtxTotal: Matrix4x4 = Matrix4x4.MULTIPLICATION(cmpLight.node.mtxWorld, cmpLight.mtxPivot);
          if (_type == LightDirectional) {
            let zero: Vector3 = Vector3.ZERO();
            mtxTotal.translation = zero;
            Recycler.store(zero);
          }

          lightsData.set(mtxTotal.get(), lightDataOffset + 4); // offset + vctColor

          // set mtxShapeInverse
          if (_type != LightDirectional) {
            let mtxInverse: Matrix4x4 = mtxTotal.inverse();
            lightsData.set(mtxInverse.get(), lightDataOffset + 4 + 16); // offset + vctColor + mtxShape
            Recycler.store(mtxInverse);
          }

          Recycler.store(mtxTotal);
          iLight++;
        }

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets[`${_uniStruct}[0].vctColor`], // byte offset of the struct Light array inside the ubo
          lightsData
        );
      }
    }

    /**
     * Draws the given nodes using the given camera and the post process components attached to the same node as the camera
     * The opaque nodes are drawn first, then ssao is applied, then bloom is applied, then nodes alpha (sortForAlpha) are drawn.
     */
    protected static drawNodes(_nodesOpaque: Iterable<Node>, _nodesAlpha: Iterable<Node>, _cmpCamera: ComponentCamera): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      const cmpFog: ComponentFog = _cmpCamera.node?.getComponent(ComponentFog);
      const cmpAmbientOcclusion: ComponentAmbientOcclusion = _cmpCamera.node?.getComponent(ComponentAmbientOcclusion);
      const cmpBloom: ComponentBloom = _cmpCamera.node?.getComponent(ComponentBloom);

      RenderWebGL.bufferFog(cmpFog);

      // opaque pass 
      // TODO: think about disabling blending for all opaque objects, this might improve performance 
      // as otherwise the 3 color attachments (color, position and normals) all need to be blended
      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
      crc3.drawBuffers(cmpAmbientOcclusion?.isActive ? // only use position and normal textures if ambient occlusion is active
        [WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.COLOR_ATTACHMENT2] :
        [WebGL2RenderingContext.COLOR_ATTACHMENT0]
      );
      RenderWebGL.clear(_cmpCamera.clrBackground);

      // crc3.disable(WebGL2RenderingContext.BLEND);
      for (let node of _nodesOpaque)
        RenderWebGL.drawNode(node, _cmpCamera);
      // crc3.enable(WebGL2RenderingContext.BLEND);

      // ambient occlusion pass
      if (cmpAmbientOcclusion?.isActive)
        RenderWebGL.drawAmbientOcclusion(_cmpCamera, cmpAmbientOcclusion);

      // bloom pass
      if (cmpBloom?.isActive)
        RenderWebGL.drawBloom(cmpBloom);

      // transparent pass TODO: think about disabling depth write for all transparent objects -> this might make depth mask option in component particle system obsolete
      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
      crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0]);

      // crc3.depthMask(false);
      for (let node of _nodesAlpha)
        RenderWebGL.drawNode(node, _cmpCamera);
      // crc3.depthMask(true);

      // copy framebuffer to canvas
      crc3.bindFramebuffer(WebGL2RenderingContext.READ_FRAMEBUFFER, RenderWebGL.fboMain);
      crc3.bindFramebuffer(WebGL2RenderingContext.DRAW_FRAMEBUFFER, RenderWebGL.fboTarget);
      crc3.blitFramebuffer(0, 0, crc3.canvas.width, crc3.canvas.height, 0, 0, crc3.canvas.width, crc3.canvas.height, WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT, WebGL2RenderingContext.NEAREST);
    }

    /**
     * Draws the occlusion over the color-buffer, using the given ambient-occlusion-component
     */
    protected static drawAmbientOcclusion(_cmpCamera: ComponentCamera, _cmpAmbientOcclusion: ComponentAmbientOcclusion): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      ShaderAmbientOcclusion.useProgram();

      RenderWebGL.bindTexture(ShaderAmbientOcclusion, RenderWebGL.texPosition, WebGL2RenderingContext.TEXTURE0, "u_texPosition");
      RenderWebGL.bindTexture(ShaderAmbientOcclusion, RenderWebGL.texNormal, WebGL2RenderingContext.TEXTURE1, "u_texNormal");
      RenderWebGL.bindTexture(ShaderAmbientOcclusion, RenderWebGL.texNoise, WebGL2RenderingContext.TEXTURE2, "u_texNoise");

      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fNear"], _cmpCamera.getNear());
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fFar"], _cmpCamera.getFar());
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fBias"], _cmpAmbientOcclusion.bias);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fSampleRadius"], _cmpAmbientOcclusion.sampleRadius);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fAttenuationConstant"], _cmpAmbientOcclusion.attenuationConstant);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fAttenuationLinear"], _cmpAmbientOcclusion.attenuationLinear);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fAttenuationQuadratic"], _cmpAmbientOcclusion.attenuationQuadratic);
      crc3.uniform2f(ShaderAmbientOcclusion.uniforms["u_vctResolution"], RenderWebGL.getCanvas().width, RenderWebGL.getCanvas().height);
      crc3.uniform3fv(ShaderAmbientOcclusion.uniforms["u_vctCamera"], _cmpCamera.mtxWorld.translation.get());

      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboPost);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor, 0);
      RenderWebGL.setBlendMode(BLEND.SUBTRACTIVE);
      crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
    }

    /**
     * Draws the bloom-effect over the color-buffer, using the given bloom-component
     */
    protected static drawBloom(_cmpBloom: ComponentBloom): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      ShaderBloom.useProgram();

      // extract bright colors, could move this to main render pass so that individual objects can be exempt from bloom
      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboPost);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[0], 0);
      RenderWebGL.clear();

      RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texColor, WebGL2RenderingContext.TEXTURE0, "u_texSource");
      crc3.uniform1f(ShaderBloom.uniforms["u_fThreshold"], _cmpBloom.threshold);
      crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 0);
      crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

      // downsample
      const iterations: number = RenderWebGL.texBloomSamples.length;
      for (let i: number = 1, divisor: number = 2; i < iterations; i++, divisor *= 2) {
        let width: number = Math.max(Math.round(crc3.canvas.width / divisor), 1);
        let height: number = Math.max(Math.round(crc3.canvas.height / divisor), 1);

        crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i], 0);
        crc3.viewport(0, 0, width, height);

        RenderWebGL.clear();

        RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texBloomSamples[i - 1], WebGL2RenderingContext.TEXTURE0, "u_texSource");
        crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 1);
        crc3.uniform2f(ShaderBloom.uniforms["u_vctTexel"], 0.5 / width, 0.5 / height); // half texel size
        // crc3.uniform2f(ShaderBloom.uniforms["u_vctResolution"], width, height);

        crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
      }

      RenderWebGL.setBlendMode(BLEND.ADDITIVE);

      // upsample
      for (let i: number = iterations - 1, divisor: number = 2 ** (iterations - 2); i > 0; i--, divisor /= 2) {
        let width: number = Math.max(Math.round(crc3.canvas.width / divisor), 1);
        let height: number = Math.max(Math.round(crc3.canvas.height / divisor), 1);

        crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i - 1], 0);
        crc3.viewport(0, 0, Math.round(width), Math.round(height));

        RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texBloomSamples[i], WebGL2RenderingContext.TEXTURE0, "u_texSource");
        crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 2);
        crc3.uniform2f(ShaderBloom.uniforms["u_vctTexel"], 0.5 / width, 0.5 / height); // half texel size
        // crc3.uniform2f(ShaderBloom.uniforms["u_vctResolution"], width, height);

        crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
      }

      crc3.viewport(0, 0, crc3.canvas.width, crc3.canvas.height);

      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor, 0);
      RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texBloomSamples[0], WebGL2RenderingContext.TEXTURE0, "u_texSource");
      crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 3);
      crc3.uniform1f(ShaderBloom.uniforms["u_fIntensity"], _cmpBloom.intensity);
      crc3.uniform1f(ShaderBloom.uniforms["u_fHighlightDesaturation"], _cmpBloom.highlightDesaturation);
      crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
    }

    /**
     * Draw a mesh buffer using the given infos and the complete projection matrix
    */
    protected static drawNode(_node: Node, _cmpCamera: ComponentCamera): void {
      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let cmpText: ComponentText = _node.getComponent(ComponentText);
      let coat: Coat = cmpMaterial.material.coat;
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let drawParticles: boolean = cmpParticleSystem && cmpParticleSystem.isActive;
      let shader: ShaderInterface = cmpMaterial.material.getShader();
      if (drawParticles)
        shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);

      shader.useProgram();
      coat.useRenderData(shader, cmpMaterial);

      let mtxMeshToWorld: Matrix4x4 = cmpMesh.mtxWorld;

      if (cmpText?.isActive)
        mtxMeshToWorld = cmpText.useRenderData(mtxMeshToWorld, _cmpCamera);

      let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(_node, mtxMeshToWorld, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
      let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(shader, mtxMeshToWorld, mtxMeshToView);

      if (cmpMesh.skeleton?.isActive)
        cmpMesh.skeleton.useRenderBuffer(shader);

      let uniform: WebGLUniformLocation = shader.uniforms["u_vctCamera"];
      if (uniform)
        RenderWebGL.crc3.uniform3fv(uniform, _cmpCamera.mtxWorld.translation.get());

      uniform = shader.uniforms["u_mtxWorldToView"];
      if (uniform)
        RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxWorldToView.get());

      uniform = shader.uniforms["u_mtxWorldToCamera"];
      if (uniform) {
        // let mtxWorldToCamera: Matrix4x4 = Matrix4x4.INVERSION(_cmpCamera.mtxWorld); // todo: optimize/store in camera
        RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxCameraInverse.get());
      }

      if (drawParticles)
        RenderWebGL.drawParticles(cmpParticleSystem, shader, renderBuffers, _node.getComponent(ComponentFaceCamera), cmpMaterial.sortForAlpha);
      else
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    }

    protected static drawParticles(_cmpParticleSystem: ComponentParticleSystem, _shader: ShaderInterface, _renderBuffers: RenderBuffers, _cmpFaceCamera: ComponentFaceCamera, _sortForAlpha: boolean): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      crc3.depthMask(_cmpParticleSystem.depthMask);
      RenderWebGL.setBlendMode(_cmpParticleSystem.blendMode);
      crc3.uniform1i(_shader.uniforms["u_iBlendMode"], _cmpParticleSystem.blendMode);
      _cmpParticleSystem.useRenderData();

      crc3.uniform1f(_shader.uniforms["u_fParticleSystemDuration"], _cmpParticleSystem.duration);
      crc3.uniform1f(_shader.uniforms["u_fParticleSystemSize"], _cmpParticleSystem.size);
      crc3.uniform1f(_shader.uniforms["u_fParticleSystemTime"], _cmpParticleSystem.time);
      crc3.uniform1i(_shader.uniforms[TEXTURE_LOCATION.PARTICLE.UNIFORM], TEXTURE_LOCATION.PARTICLE.INDEX);

      let faceCamera: boolean = _cmpFaceCamera && _cmpFaceCamera.isActive;
      crc3.uniform1i(_shader.uniforms["u_bParticleSystemFaceCamera"], faceCamera ? 1 : 0);
      crc3.uniform1i(_shader.uniforms["u_bParticleSystemRestrict"], faceCamera && _cmpFaceCamera.restrict ? 1 : 0);

      crc3.drawElementsInstanced(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0, _cmpParticleSystem.size);

      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
      crc3.depthMask(true);
    }

    private static calcMeshToView(_node: Node, _mtxMeshToWorld: Matrix4x4, _mtxWorldToView: Matrix4x4, _target?: Vector3): Matrix4x4 {
      // TODO: This could be a Render function as it does not do anything with WebGL
      let cmpFaceCamera: ComponentFaceCamera = _node.getComponent(ComponentFaceCamera);
      if (cmpFaceCamera && cmpFaceCamera.isActive) {
        let mtxMeshToView: Matrix4x4; // mesh to world?
        mtxMeshToView = _mtxMeshToWorld.clone;
        mtxMeshToView.lookAt(_target, cmpFaceCamera.upLocal ? null : cmpFaceCamera.up, cmpFaceCamera.restrict);
        return Matrix4x4.MULTIPLICATION(_mtxWorldToView, mtxMeshToView);
      }

      return Matrix4x4.MULTIPLICATION(_mtxWorldToView, _mtxMeshToWorld);
    }

    private static bindTexture(_shader: ShaderInterface, _texture: WebGLTexture, _unit: number, _uniform: string): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.activeTexture(_unit);
      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
      crc3.uniform1i(_shader.uniforms[_uniform], _unit - WebGL2RenderingContext.TEXTURE0);
    }
  }
}