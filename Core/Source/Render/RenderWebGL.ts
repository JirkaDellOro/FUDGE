///<reference path="RenderInjector.ts"/>
///<reference path="RenderInjectorShader.ts"/>
///<reference path="RenderInjectorCoat.ts"/>
///<reference path="RenderInjectorMesh.ts"/>
///<reference path="../Math/Rectangle.ts"/>

namespace FudgeCore {
  export declare let fudgeConfig: General;

  export type RenderTexture = WebGLTexture;

  export enum BLEND {
    OPAQUE, TRANSPARENT, PARTICLE
  }

  export interface BufferSpecification {
    size: number;   // The size of the datasample.
    dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
    normalize: boolean; // Flag to normalize the data.
    stride: number; // Number of indices that will be skipped each iteration.
    offset: number; // Index of the element to begin with.
  }

  /**
   * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
   * Methods and attributes of this class should not be called directly, only through {@link Render}
   */
  export abstract class RenderWebGL extends EventTargetStatic {
    protected static crc3: WebGL2RenderingContext = RenderWebGL.initialize();
    protected static ƒpicked: Pick[];
    private static rectRender: Rectangle = RenderWebGL.getCanvasRect();
    private static sizePick: number;

    /**
     * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
     */
    public static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext {
      fudgeConfig = fudgeConfig || {};
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
    public static resetFrameBuffer(_color: Color = null): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
    }

    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getRenderRectangle(): Rectangle {
      return RenderWebGL.rectRender;
    }

    public static setDepthTest(_test: boolean): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
    }

    public static setBlendMode(_mode: BLEND): void {
      switch (_mode) {
        case BLEND.OPAQUE:
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
          break;
        case BLEND.TRANSPARENT:
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
          // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
          break;
        case BLEND.PARTICLE:
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
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
        let shader: typeof Shader = coat instanceof CoatTextured ? ShaderPickTextured : ShaderPick;

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
     * Set light data in shaders
     */
    protected static setLightsInShader(_shader: typeof Shader, _lights: MapLightTypeToLightList): void {
      _shader.useProgram();
      let uni: { [name: string]: WebGLUniformLocation } = _shader.uniforms;

      // Ambient
      let ambient: WebGLUniformLocation = uni["u_ambient.vctColor"];
      if (ambient) {
        RenderWebGL.crc3.uniform4fv(ambient, [0, 0, 0, 0]);
        let cmpLights: RecycableArray<ComponentLight> = _lights.get(LightAmbient);
        if (cmpLights) {
          // TODO: add up ambient lights to a single color
          let result: Color = new Color(0, 0, 0, 1);
          for (let cmpLight of cmpLights)
            result.add(cmpLight.light.color);
          RenderWebGL.crc3.uniform4fv(ambient, result.getArray());
        }
      }

      fillLightBuffers(LightDirectional, "u_nLightsDirectional", "u_directional");
      fillLightBuffers(LightPoint, "u_nLightsPoint", "u_point");
      fillLightBuffers(LightSpot, "u_nLightsSpot", "u_spot");

      function fillLightBuffers(_type: TypeOfLight, _uniNumber: string, _uniStruct: string): void {
        let uniLights: WebGLUniformLocation = uni[_uniNumber];
        if (uniLights) {
          RenderWebGL.crc3.uniform1ui(uniLights, 0);
          let cmpLights: RecycableArray<ComponentLight> = _lights.get(_type);
          if (cmpLights) {
            let n: number = cmpLights.length;
            RenderWebGL.crc3.uniform1ui(uniLights, n);
            let i: number = 0;
            for (let cmpLight of cmpLights) {
              RenderWebGL.crc3.uniform4fv(uni[`${_uniStruct}[${i}].vctColor`], cmpLight.light.color.getArray());
              //TODO: could be optimized, no need to calculate for each shader
              let mtxTotal: Matrix4x4 = Matrix4x4.MULTIPLICATION(cmpLight.node.mtxWorld, cmpLight.mtxPivot);
              RenderWebGL.crc3.uniformMatrix4fv(uni[`${_uniStruct}[${i}].mtxShape`], false, mtxTotal.get());
              if (_type != LightDirectional) {
                let mtxInverse: Matrix4x4 = mtxTotal.inverse();
                RenderWebGL.crc3.uniformMatrix4fv(uni[`${_uniStruct}[${i}].mtxShapeInverse`], false, mtxInverse.get());
                Recycler.store(mtxInverse);
              }
              Recycler.store(mtxTotal);
              i++;
            }
          }
        }
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
      let shader: typeof Shader = cmpMaterial.material.getShader();

      shader.useProgram();
      coat.useRenderData(shader, cmpMaterial);
      let mtxMeshToView: Matrix4x4 = this.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
      let renderBuffers: RenderBuffers = this.getRenderBuffers(cmpMesh, shader, mtxMeshToView);

      let uCamera: WebGLUniformLocation = shader.uniforms["u_vctCamera"];
      if (uCamera)
        RenderWebGL.crc3.uniform3fv(uCamera, _cmpCamera.mtxWorld.translation.get());
      let uWorldToView: WebGLUniformLocation = shader.uniforms["u_mtxWorldToView"];
      if (uWorldToView)
        RenderWebGL.crc3.uniformMatrix4fv(uWorldToView, false, _cmpCamera.mtxWorldToView.get());
      RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
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

    private static getRenderBuffers(_cmpMesh: ComponentMesh, _shader: typeof Shader, _mtxMeshToView: Matrix4x4): RenderBuffers {
      if (_cmpMesh.mesh instanceof MeshSkin)
        // TODO: make mesh skin pickable
        return _cmpMesh.mesh.useRenderBuffers(_shader, _cmpMesh.mtxWorld, _mtxMeshToView, null, _cmpMesh.skeleton.mtxBones);
      else
        return _cmpMesh.mesh.useRenderBuffers(_shader, _cmpMesh.mtxWorld, _mtxMeshToView);
    }
  }
}