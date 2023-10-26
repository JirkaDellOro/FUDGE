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

  export interface BufferSpecification {
    size: number;   // The size of the datasample.
    dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
    normalize: boolean; // Flag to normalize the data.
    stride: number; // Number of indices that will be skipped each iteration.
    offset: number; // Index of the element to begin with.
  }

  export const UNIFORM_BLOCKS: { [block: string]: { NAME: string; BINDING: number } } = {
    LIGHTS: {
      NAME: "Lights",
      BINDING: 0
    },
    SKIN: {
      NAME: "Skin",
      BINDING: 1
    }
  };

  export const TEXTURE_LOCATION: { [name: string]: { UNIFORM: string; UNIT: number; INDEX: number} } = {
    ALBEDO: {
      UNIFORM: "u_texture", // TODO: mabye rename to u_albedo?
      UNIT: WebGL2RenderingContext.TEXTURE0,
      INDEX: 0 // could compute these by WebGL2RenderingContext.TEXTURE0 - UNIT
    },
    NORMAL: {
      UNIFORM: "u_normalMap",
      UNIT: WebGL2RenderingContext.TEXTURE1,
      INDEX: 1
    },
    PARTICLE: {
      UNIFORM: "u_particleSystemRandomNumbers",
      UNIT: WebGL2RenderingContext.TEXTURE2,
      INDEX: 2
    }
  };
  
  // Interface for transfering needed buffer data
  export interface PostBufferdata {
    fbo: WebGLFramebuffer;
    texture: WebGLTexture;
    depthTexture: WebGLTexture;
  }

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

    /**
     * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
     */
    public static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext {
      let fudgeConfig: General = Reflect.get(globalThis, "fudgeConfig") || {};
      let contextAttributes: WebGLContextAttributes = {
        alpha: (_alpha != undefined) ? _alpha : fudgeConfig.alpha || false,
        antialias: (_antialias != undefined) ? _antialias : fudgeConfig.antialias || false,
        premultipliedAlpha: false
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
      crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
      // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
      RenderWebGL.rectRender = RenderWebGL.getCanvasRect();

      return crc3;
    }

    /** 
     * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
     * @param _attributeLocation  The location of the attribute on the shader, to which they data will be passed.
     * @param _bufferSpecification  Interface passing datapullspecifications to the buffer.
     */
    public static setAttributeStructure(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
      RenderWebGL.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
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
    public static clear(_color: Color = null): void {
      RenderWebGL.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
      RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
    }

    /**
     * Reset the offscreen framebuffer to the original RenderingContext
     */
    public static resetFrameBuffer(_frameBuffer: WebGLFramebuffer = null): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, _frameBuffer);
    }

    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getRenderRectangle(): Rectangle {
      return RenderWebGL.rectRender;
    }

    /**
     * Enable / Disable WebGLs depth test
     */
    public static setDepthTest(_test: boolean): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
    }

    /**
     * Set the blend mode to render with
     */
    public static setBlendMode(_mode: BLEND): void {
      switch (_mode) {
        case BLEND.OPAQUE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
          break;
        case BLEND.TRANSPARENT:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
          // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
          break;
        case BLEND.ADDITIVE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
        case BLEND.SUBTRACTIVE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
        case BLEND.MODULATE: // color gets multiplied, tried to copy unitys "Particle Shader: Blending Option: Rendering Mode: Modulate"
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
        default:
          break;
      }
    }

    //#region Picking
    /**
     * Creates a texture buffer to be used as pick-buffer
     */
    protected static createPickTexture(_size: number): RenderTexture {
      // create to render to
      const targetTexture: RenderTexture = Render.crc3.createTexture();
      Render.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);

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
    protected static pick(_node: Node, _mtxMeshToWorld: Matrix4x4, _cmpCamera: ComponentCamera): void { // create Texture to render to, int-rgba
      try {
        let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
        let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
        let coat: Coat = cmpMaterial.material.coat;
        let shader: ShaderInterface = coat instanceof CoatTextured ? ShaderPickTextured : ShaderPick;

        shader.useProgram();
        coat.useRenderData(shader, cmpMaterial);
        let mtxMeshToView: Matrix4x4 = this.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);

        let sizeUniformLocation: WebGLUniformLocation = shader.uniforms["u_vctSize"];
        RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);

        let mesh: Mesh = cmpMesh.mesh;
        let renderBuffers: RenderBuffers = mesh.useRenderBuffers(shader, _mtxMeshToWorld, mtxMeshToView, Render.ƒpicked.length);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        let pick: Pick = new Pick(_node);
        Render.ƒpicked.push(pick);
      } catch (_error) {
        //
      }
    }
    //#endregion

    //#region Lights
    /**
     * Buffer the data from the lights in the scenegraph into the lights ubo
     */
    protected static updateLightsUBO(_lights: MapLightTypeToLightList): void {
      if (!RenderWebGL.uboLights)
        return;

      RenderWebGL.crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, RenderWebGL.uboLights);

      // fill the buffer with the ambient light color
      let cmpLights: RecycableArray<ComponentLight> = _lights.get(LightAmbient);
      if (cmpLights) {
        let result: Color = new Color(0, 0, 0, 0);
        for (let cmpLight of cmpLights)
          result.add(cmpLight.light.color);

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets["u_ambient.vctColor"], // byte offset of the struct Light "u_ambient" inside the ubo
          new Float32Array(result.getArray())
        );
      }

      // fill the buffer with the light data for each light type
      // we are currently doing a maximum of 4 crc3.bufferSubData() calls, but we could do this in one call
      updateLights(LightDirectional, "u_nLightsDirectional", "u_directional");
      updateLights(LightPoint, "u_nLightsPoint", "u_point");
      updateLights(LightSpot, "u_nLightsSpot", "u_spot");

      function updateLights(_type: TypeOfLight, _uniName: string, _uniStruct: string): void {
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
    //#endregionF

    //#region Post-FX
    /**
     * Creates and stores texture buffers to be used for Post-FX
     */
    public static initFBOs(_mist: boolean = true, _ao: boolean = true, _bloom: boolean = true): void {
      let mainBufferData: PostBufferdata = RenderWebGL.setupFBO();
      Render.mainFBO = mainBufferData.fbo;
      Render.mainTexture = mainBufferData.texture;
      Render.aoDepthTexture = mainBufferData.depthTexture;    //TODO: Since the normalcalculations for the AO pass as of for now do not support transparent materials the depthTexture is taken from the main render for transparency support in the depth pass
      Render.initScreenQuad(Render.mainTexture);

      if (_mist) {
        let mistBufferData: PostBufferdata = RenderWebGL.setupFBO();
        Render.mistFBO = mistBufferData.fbo;
        Render.mistTexture = mistBufferData.texture;
        let tempMistMat: Material = new Material("mistMat", ShaderMist);
        Render.cmpMistMaterial = new ComponentMaterial(tempMistMat);
        Project.deregister(tempMistMat);  //Deregister this Material to prevent listing in the internal resources of the editor
      }
      if (_ao) {
        let aoBufferData: PostBufferdata = RenderWebGL.setupFBO();
        Render.aoFBO = aoBufferData.fbo;
        Render.aoTexture = aoBufferData.texture;

        let aoNormalBufferData: PostBufferdata = RenderWebGL.setupFBO();
        Render.aoNormalFBO = aoNormalBufferData.fbo;
        Render.aoNormalTexture = aoNormalBufferData.texture;

        let tempNormalMat: Material = new Material("normalMat", ShaderAONormal);
        Render.cmpSmoothNormalMaterial = new ComponentMaterial(tempNormalMat);
        Project.deregister(tempNormalMat);  //Deregister this Material to prevent listing in the internal resources of the editor
        let tempNormalFlatMat: Material = new Material("normalFlatMat", ShaderAONormalFlat);
        Render.cmpFlatNormalMaterial = new ComponentMaterial(tempNormalFlatMat);
        Project.deregister(tempNormalFlatMat);  //Deregister this Material to prevent listing in the internal resources of the editor

        RenderWebGL.generateNewSamplePoints();
      }
      if (_bloom) {
        Render.bloomDownsamplingFBOs.splice(0, Render.bloomDownsamplingFBOs.length);
        Render.bloomDownsamplingTextures.splice(0, Render.bloomDownsamplingTextures.length);
        Render.bloomUpsamplingFBOs.splice(0, Render.bloomUpsamplingFBOs.length);
        Render.bloomUpsamplingTextures.splice(0, Render.bloomUpsamplingTextures.length);

        let div: number = 2;
        for (let i: number = 0; i < Render.downsamplingDepth; i++) {
          let downsamplingBufferData: PostBufferdata = RenderWebGL.setupFBO(null, null, null, div);
          Render.bloomDownsamplingFBOs.push(downsamplingBufferData.fbo);
          Render.bloomDownsamplingTextures.push(downsamplingBufferData.texture);
          div *= 2;
        }

        div = 2;
        for (let i: number = 0; i < Render.downsamplingDepth - 1; i++) {
          let upsamplingBufferData: PostBufferdata = RenderWebGL.setupFBO(null, null, null, div);
          Render.bloomUpsamplingFBOs.push(upsamplingBufferData.fbo);
          Render.bloomUpsamplingTextures.push(upsamplingBufferData.texture);
          div *= 2;
        }
      }
    }

    /**
    * Calculates sample points to be used in AO-calculations, based on the specified samplecount
     */
    protected static generateNewSamplePoints(_nSamples: number = 64) {
      Render.aoSamplePoints.splice(0,Render.aoSamplePoints.length);
      for (let i: number = 0; i < _nSamples; i++) {
        let sample: Vector3 = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random());
        sample.normalize();
        sample.scale(Math.random());
        let scale: number = i / _nSamples;
        sample.scale(((scale * scale) * 0.9) + 0.1); //Moves the samplepoints closer to the origin
        Render.aoSamplePoints.push(sample);
      }
    }

    /**
     * Sets up and configures framebuffers and textures for post-fx
    */
    protected static setupFBO(_fbo: WebGLFramebuffer = null, _tex: WebGLTexture = null, _depthTexture: WebGLTexture = null, _divider: number = 1): PostBufferdata {
      let postBufferData: PostBufferdata;
      let width: number = Math.max(Math.round(RenderWebGL.crc3.canvas.width / _divider), 1);         //the _divider variable is used for Downsampling (for bloom shader)
      let height: number = Math.max(Math.round(RenderWebGL.crc3.canvas.height / _divider), 1);
      let framebuffer: WebGLFramebuffer;
      let texture: RenderTexture;
      let depthTexture: WebGLTexture;

      //console.log("x: " + sizeX + ", y: " + sizeY);

      let error = function (): PostBufferdata {
        if (framebuffer) RenderWebGL.crc3.deleteFramebuffer(framebuffer);
        if (texture) RenderWebGL.crc3.deleteTexture(texture);
        if (depthTexture) RenderWebGL.crc3.deleteRenderbuffer(depthTexture);
        return null;
      }

      //Create FBO or use existing
      if (_fbo == null) {
        framebuffer = RenderWebGL.crc3.createFramebuffer();
        if (!framebuffer) {
          console.log("Failed to create FBO");
          return error();
        }
      } else {
        framebuffer = _fbo;
      }

      //TODO: Only use a Depthtexture if necessary. Otherwise use a Renderbuffer
      //Create Texture Object
      if (_tex == null) {
        texture = RenderWebGL.crc3.createTexture();
        if (!texture) {
          console.log("Failed to create Texture Oject");
          return error();
        }
      } else {
        texture = _tex;
      }
      
      RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);

      //TODO: Use RenderBuffer if a readable depthtexture is not necessary
      //Create depthTexture
      if (_depthTexture == null) {
        depthTexture = RenderWebGL.crc3.createTexture();
        if (!depthTexture) {
          console.log("Failed to create Texture Object");
          return error();
        }
      } else {
        depthTexture = _depthTexture;
      }
      RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, depthTexture);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.DEPTH_COMPONENT32F, width, height, 0, WebGL2RenderingContext.DEPTH_COMPONENT, WebGL2RenderingContext.FLOAT, null);
      
      //Attach texture and render buffer object to the FBO
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
      RenderWebGL.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, texture, 0);
      RenderWebGL.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_ATTACHMENT, WebGL2RenderingContext.TEXTURE_2D, depthTexture, 0);

      //Check if FBO is configured correctly
      let e: number = RenderWebGL.crc3.checkFramebufferStatus(WebGL2RenderingContext.FRAMEBUFFER);
      if (WebGL2RenderingContext.FRAMEBUFFER_COMPLETE !== e) {
        console.log("FBO is incomplete: " + e.toString());
        return error();
      }

      //Unbind the buffer object
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
      RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
      RenderWebGL.crc3.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, null);
      postBufferData = { fbo: framebuffer, texture: texture, depthTexture: depthTexture };
      return postBufferData;
    }


    /**
     * updates texture and renderbuffer sizes for given FBO
     */
    public static adjustBufferSize(_fbo: WebGLFramebuffer, _tex: WebGLTexture, _depth: WebGLTexture, _divider: number = 1): void {
      let bufferData: PostBufferdata = RenderWebGL.setupFBO(_fbo, _tex, _depth, _divider);
      _tex = bufferData.texture;
    }

    /**
     * updates all off the bloom FBOs and textures
     */
    public static adjustBlooomBufferSize(): void {
      let div: number = 2;
      for (let i: number = 0; i < Render.bloomDownsamplingFBOs.length; i++) {
        this.adjustBufferSize(Render.bloomDownsamplingFBOs[i], Render.bloomDownsamplingTextures[i], null, div);
        div *= 2;
      }
      div = 2;
      for (let i: number = 0; i < Render.bloomUpsamplingFBOs.length; i++) {
        this.adjustBufferSize(Render.bloomUpsamplingFBOs[i], Render.bloomUpsamplingTextures[i], null, div);
        div *= 2;
      }
    }
    //#endregion

    /**
     * Draw a mesh buffer using the given infos and the complete projection matrix
    */
    protected static drawNode(_node: Node, _cmpCamera: ComponentCamera): void {
      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let coat: Coat = cmpMaterial.material.coat;
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let drawParticles: boolean = cmpParticleSystem && cmpParticleSystem.isActive;
      let shader: ShaderInterface = cmpMaterial.material.getShader();
      if (drawParticles)
        shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);

      shader.useProgram();
      coat.useRenderData(shader, cmpMaterial);

      let mtxMeshToView: Matrix4x4 = this.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
      let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(shader, cmpMesh.mtxWorld, mtxMeshToView);

      if (cmpMesh.skeleton)
        if (cmpMesh.skeleton instanceof SkeletonInstance)
          cmpMesh.skeleton.useRenderBuffer(shader);
        else
          Debug.warn(`${RenderWebGL.name}: ${ComponentMesh.name} references ${Skeleton.name}Id ${cmpMesh.skeleton} and not an instance of it. This can happen if this node is not a descendant of the referenced skeleton inside the graph. FUDGE currently only supports skinned meshes with a skeleton that is a direct ancestor of the mesh.`);

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

      if (drawParticles) {
        RenderWebGL.drawParticles(cmpParticleSystem, shader, renderBuffers, _node.getComponent(ComponentFaceCamera), cmpMaterial.sortForAlpha);
      } else {
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      }
    }

    /**
     * Draw all of the given nodes using the normal shader to be used in AO-calculations
    */
    public static drawNodesNormal(_cmpCamera: ComponentCamera, _list: RecycableArray<Node> | Array<Node>, _cmpAO: ComponentAmbientOcclusion): void {
      let shaderSmooth: ShaderInterface = Render.cmpSmoothNormalMaterial.material.getShader();  
      let shaderFlat: ShaderInterface = Render.cmpFlatNormalMaterial.material.getShader(); // TODO: remove flat shading stuff     //since Shaders handle Flat materials differently we use the different defines of these two materials
      let tempShader: ShaderInterface;
      let coat: Coat = Render.cmpFlatNormalMaterial.material.coat;

      for (let node of _list) {
        if(node.getComponent(ComponentMaterial).material.getShader().define.includes("FLAT")){
          tempShader = shaderFlat;
        }else{
          tempShader = shaderSmooth;
        }
        tempShader.useProgram();
        coat.useRenderData(tempShader, Render.cmpSmoothNormalMaterial);
        let uniform = tempShader.uniforms["u_mtxWorldToCamera"];
        RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxCameraInverse.get());

        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
        let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(tempShader, cmpMesh.mtxWorld, mtxMeshToView);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      }
    }

    /**
     * Draw all of the given nodes using the mist shader.
    */
    public static drawNodesMist(_cmpCamera: ComponentCamera, _list: RecycableArray<Node> | Array<Node>, _cmpMist: ComponentMist): void {
      let cmpMaterial: ComponentMaterial = Render.cmpMistMaterial;
      let coat: Coat = cmpMaterial.material.coat;
      let shader: ShaderInterface = cmpMaterial.material.getShader();
      shader.useProgram();
      coat.useRenderData(shader, cmpMaterial);

      let uniform: WebGLUniformLocation = shader.uniforms["u_vctCamera"];
      RenderWebGL.crc3.uniform3fv(uniform, _cmpCamera.mtxWorld.translation.get());
      uniform = shader.uniforms["u_nearPlane"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, _cmpMist.nearPlane);
      uniform = shader.uniforms["u_farPlane"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, _cmpMist.farPlane);

      for (let node of _list) {
        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
        let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(shader, cmpMesh.mtxWorld, mtxMeshToView);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      }
    }

    /**
    * composites all effects that are used in the scene to a final render.
     */
    public static compositeEffects(_cmpCamera: ComponentCamera, _cmpMist: ComponentMist, _cmpAO: ComponentAmbientOcclusion, _cmpBloom: ComponentBloom): void {
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);              //Reset to main color buffer
      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);

      //feed texture and uniform matrix
      function bindTexture(_texture: WebGLTexture, _texSlot: number, _texSlotNumber: number, _texVarName: string): void {
        RenderWebGL.crc3.activeTexture(_texSlot);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms[_texVarName], _texSlotNumber);
      }

      let shader: typeof Shader = ShaderScreen;
      shader.useProgram();
      Render.useScreenQuadRenderData(shader);

      //set main-render
      bindTexture(Render.mainTexture, WebGL2RenderingContext.TEXTURE0, 0, "u_mainTexture");
      RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_width"], Render.crc3.canvas.width);
      RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_height"], Render.crc3.canvas.height);

      //set ao-texture and color if available
      if (_cmpAO != null) if (_cmpAO.isActive) {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_ao"], 1);
        bindTexture(Render.aoTexture, WebGL2RenderingContext.TEXTURE1, 1, "u_aoTexture");
        RenderWebGL.getRenderingContext().uniform4fv(shader.uniforms["u_vctAOColor"], _cmpAO.clrAO.getArray());
      } else {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_ao"], 0);
      }

      //set mist-texture and color if available
      if (_cmpMist != null) if (_cmpMist.isActive) {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_mist"], 1);
        bindTexture(Render.mistTexture, WebGL2RenderingContext.TEXTURE2, 2, "u_mistTexture");
        RenderWebGL.getRenderingContext().uniform4fv(shader.uniforms["u_vctMistColor"], _cmpMist.clrMist.getArray());
      } else {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_mist"], 0);
      }

      //set bloom-texture, intensity and highlight desaturation if available
      if (_cmpBloom != null) if (_cmpBloom.isActive) {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_bloom"], 1);
        bindTexture(Render.bloomUpsamplingTextures[0], WebGL2RenderingContext.TEXTURE3, 3, "u_bloomTexture");
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_bloomIntensity"], _cmpBloom.intensity);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_highlightDesaturation"], _cmpBloom.desaturateHighlights);
      } else {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_bloom"], 0);
      }

      RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLE_STRIP, 0, 4);
    }

    protected static drawParticles(_cmpParticleSystem: ComponentParticleSystem, _shader: ShaderInterface, _renderBuffers: RenderBuffers, _cmpFaceCamera: ComponentFaceCamera, _sortForAlpha: boolean): void {
      RenderWebGL.crc3.depthMask(_cmpParticleSystem.depthMask);
      RenderWebGL.setBlendMode(_cmpParticleSystem.blendMode);
      _cmpParticleSystem.useRenderData();

      RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemDuration"], _cmpParticleSystem.duration);
      RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemSize"], _cmpParticleSystem.size);
      RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemTime"], _cmpParticleSystem.time);
      RenderWebGL.crc3.uniform1i(_shader.uniforms[TEXTURE_LOCATION.PARTICLE.UNIFORM], TEXTURE_LOCATION.PARTICLE.INDEX);

      let faceCamera: boolean = _cmpFaceCamera && _cmpFaceCamera.isActive;
      RenderWebGL.crc3.uniform1i(_shader.uniforms["u_bParticleSystemFaceCamera"], faceCamera ? 1 : 0);
      RenderWebGL.crc3.uniform1i(_shader.uniforms["u_bParticleSystemRestrict"], faceCamera && _cmpFaceCamera.restrict ? 1 : 0);

      RenderWebGL.crc3.drawElementsInstanced(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0, _cmpParticleSystem.size);

      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
      RenderWebGL.crc3.depthMask(true);
    }

    private static calcMeshToView(_node: Node, _cmpMesh: ComponentMesh, _mtxWorldToView: Matrix4x4, _target?: Vector3): Matrix4x4 {
      let cmpFaceCamera: ComponentFaceCamera = _node.getComponent(ComponentFaceCamera);
      if (cmpFaceCamera && cmpFaceCamera.isActive) {
        let mtxMeshToView: Matrix4x4;
        mtxMeshToView = _cmpMesh.mtxWorld.clone;
        mtxMeshToView.lookAt(_target, cmpFaceCamera.upLocal ? null : cmpFaceCamera.up, cmpFaceCamera.restrict);
        return Matrix4x4.MULTIPLICATION(_mtxWorldToView, mtxMeshToView);
      }

      return Matrix4x4.MULTIPLICATION(_mtxWorldToView, _cmpMesh.mtxWorld);
    }
  }
}