// / <reference path="RenderOperator.ts"/>
namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, ComponentLight[]>;

  export interface PickBuffer {
    node: Node;
    texture: WebGLTexture;
    frameBuffer: WebGLFramebuffer;
  }

  export abstract class RenderManager extends RenderOperator {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    private static timestampUpdate: number;
    private static pickBuffers: PickBuffer[];

    /**
     * Clear the offscreen renderbuffer with the given [[Color]]
     * @param _color 
     */
    public static clear(_color: Color = null): void {
      RenderManager.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
      RenderManager.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
    }

    /**
     * Reset the offscreen framebuffer to the original RenderingContext
     */
    public static resetFrameBuffer(_color: Color = null): void {
      RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
    }

    /**
     * Draws the branch starting with the given [[Node]] using the camera given [[ComponentCamera]].
     * @param _node 
     * @param _cmpCamera 
     */
    public static drawBranch(_node: Node, _cmpCamera: ComponentCamera, _drawNode: Function = RenderManager.drawNode): void {
      // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      if (!_node.isActive)
        return;
      if (_drawNode == RenderManager.drawNode)
        RenderManager.resetFrameBuffer();
      let matrix: Matrix4x4 = Matrix4x4.IDENTITY();
      if (_node.getParent())
        matrix = _node.getParent().mtxWorld;

      let lights: MapLightTypeToLightList = RenderManager.getLightsAndUpdateBranch(_node, matrix);

      let finalTransform: Matrix4x4;

      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      if (cmpMesh)
        finalTransform = Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);
      else
        finalTransform = _node.mtxWorld; // caution, RenderManager is a reference...

      // multiply camera matrix
      let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);

      _drawNode(_node, finalTransform, projection, lights);

      for (let name in _node.getChildren()) {
        let childNode: Node = _node.getChildren()[name];
        RenderManager.drawBranch(childNode, _cmpCamera, _drawNode); //, world);
      }

      Recycler.store(projection);
      if (finalTransform != _node.mtxWorld)
        Recycler.store(finalTransform);
    }

    //#region RayCast & Picking

    /**
     * Draws the branch for RayCasting starting with the given [[Node]] using the camera given [[ComponentCamera]].
     * @param _node 
     * @param _cmpCamera 
     */
    public static drawBranchForRayCast(_node: Node, _cmpCamera: ComponentCamera): PickBuffer[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      RenderManager.pickBuffers = [];
      //TODO: examine, why switching blendFunction is necessary 
      RenderOperator.crc3.blendFunc(1, 0);
      RenderManager.drawBranch(_node, _cmpCamera, RenderManager.drawNodeForRayCast);
      RenderOperator.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);

      RenderManager.resetFrameBuffer();
      return RenderManager.pickBuffers;
    }

    public static pickNodeAt(_pos: Vector2, _pickBuffers: PickBuffer[], _rect: Rectangle): RayHit[] {
      let hits: RayHit[] = [];

      for (let pickBuffer of _pickBuffers) {
        RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, pickBuffer.frameBuffer);
        // TODO: instead of reading all data and afterwards pick the pixel, read only the pixel!
        let data: Uint8Array = new Uint8Array(_rect.width * _rect.height * 4);
        RenderManager.crc3.readPixels(0, 0, _rect.width, _rect.height, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, data);
        let pixel: number = _pos.x + _rect.width * _pos.y;

        // let zBuffer: number = data[4 * pixel + 1] + data[4 * pixel + 2] / 256;
        let zBuffer: number = data[4 * pixel + 0];
        let hit: RayHit = new RayHit(pickBuffer.node, 0, zBuffer);

        hits.push(hit);
      }

      return hits;
    }


    private static drawNode(_node: Node, _finalTransform: Matrix4x4, _projection: Matrix4x4, _lights: MapLightTypeToLightList): void {
      try {
        let material: Material = _node.getComponent(ComponentMaterial).material;
        let coat: Coat = material.getCoat();
        let shader: typeof Shader = material.getShader();
        let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
        RenderManager.draw(shader, mesh, coat, _finalTransform, _projection);
      } catch (_error) {
        //
      }
    }

    private static drawNodeForRayCast(_node: Node, _finalTransform: Matrix4x4, _projection: Matrix4x4): void { // create Texture to render to, int-rgba
      // TODO: look into SSBOs!
      let target: WebGLTexture = RenderManager.getRayCastTexture();

      const framebuffer: WebGLFramebuffer = RenderManager.crc3.createFramebuffer();
      // render to our targetTexture by binding the framebuffer
      RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
      // attach the texture as the first color attachment
      const attachmentPoint: number = WebGL2RenderingContext.COLOR_ATTACHMENT0;
      RenderManager.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, target, 0);

      try {
        let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
        ShaderRayCast.useProgram();
        let pickBuffer: PickBuffer = { node: _node, texture: target, frameBuffer: framebuffer };
        RenderManager.pickBuffers.push(pickBuffer);
        mesh.useRenderBuffers(ShaderRayCast, _finalTransform, _projection, RenderManager.pickBuffers.length);

        RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      } catch (_error) {
        //
      }
      // make texture available to onscreen-display
    }

    private static getRayCastTexture(): WebGLTexture {
      // create to render to
      const targetTextureWidth: number = RenderManager.getViewportRectangle().width;
      const targetTextureHeight: number = RenderManager.getViewportRectangle().height;
      const targetTexture: WebGLTexture = RenderManager.crc3.createTexture();
      RenderManager.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);

      {
        const internalFormat: number = WebGL2RenderingContext.RGBA8;
        const format: number = WebGL2RenderingContext.RGBA;
        const type: number = WebGL2RenderingContext.UNSIGNED_BYTE;
        RenderManager.crc3.texImage2D(
          WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, targetTextureWidth, targetTextureHeight, 0, format, type, null
        );

        // set the filtering so we don't need mips
        RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
        RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      }

      return targetTexture;
    }
    //#endregion

    /**
     * Recursive method receiving a childnode and its parents updated world transform.  
     * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
     */
    private static getLightsAndUpdateBranch(_node: Node, _world: Matrix4x4 = Matrix4x4.IDENTITY(), _lights: MapLightTypeToLightList = new Map()): MapLightTypeToLightList {
      let world: Matrix4x4 = _world;
      let cmpTransform: ComponentTransform = _node.cmpTransform;
      if (cmpTransform)
        world = Matrix4x4.MULTIPLICATION(_world, cmpTransform.local);

      _node.mtxWorld = world;
      _node.timestampUpdate = RenderManager.timestampUpdate;

      let cmpLights: ComponentLight[] = _node.getComponents(ComponentLight);
      for (let cmpLight of cmpLights) {
        let type: TypeOfLight = cmpLight.light.getType();
        let lightsOfType: ComponentLight[] = _lights.get(type);
        if (!lightsOfType) {
          lightsOfType = [];
          _lights.set(type, lightsOfType);
        }
        lightsOfType.push(cmpLight);
      }

      for (let child of _node.getChildren()) {
        _lights = RenderManager.getLightsAndUpdateBranch(child, world, _lights);
      }

      return _lights;
    }
  }
}