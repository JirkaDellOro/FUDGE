namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, ComponentLight[]>;

  /**
   * Rendered texture for each node for picking
   */
  export interface PickBuffer {
    node: Node;
    // texture: WebGLTexture;
    frameBuffer: WebGLFramebuffer;
  }
  /**
   * Information on each node from picking
   */
  export interface Pick {
    node: Node;
    zBuffer: number;
    alpha: number;
  }

  /**
   * The main interface to the render engine, here WebGL, which is used mainly in the superclass [[RenderWebGL]]
   * TODO: move all WebGL-specifica to RenderWebGL
   */
  export abstract class Render extends RenderWebGL {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    public static pickTexture: WebGLTexture;
    public static pickBuffer: Uint8Array;
    private static timestampUpdate: number;
    private static pickBuffers: PickBuffer[];
    private static picks: Pick[];
    private static pickSize: Vector2;

    //#region RayCast & Picking
    /**
     * Creates a texture buffer to be used as pick-buffer
     */
    public static createPickTexture(_width: number, _height: number): WebGLTexture {
      Render.pickSize = new Vector2(_width, _height);
      // create to render to
      const targetTextureWidth: number = _width;
      const targetTextureHeight: number = _height;
      const targetTexture: WebGLTexture = Render.crc3.createTexture();
      Render.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);

      {
        const internalFormat: number = WebGL2RenderingContext.RGBA8;
        const format: number = WebGL2RenderingContext.RGBA;
        const type: number = WebGL2RenderingContext.UNSIGNED_BYTE;
        Render.pickBuffer = new Uint8Array(_width * _height * 4);
        Render.crc3.texImage2D(
          WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, targetTextureWidth, targetTextureHeight, 0, format, type, Render.pickBuffer
        );

        // set the filtering so we don't need mips
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      }

      return targetTexture;
    }
    /**
     * Draws the graph for RayCasting starting with the given [[Node]] using the camera given [[ComponentCamera]].
     */
    public static drawGraphForRayCast(_node: Node, _cmpCamera: ComponentCamera): PickBuffer[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      Render.pickBuffers = [];
      //TODO: examine, why switching blendFunction is necessary 
      // RenderWebGL.crc3.blendFunc(1, 0);
      Render.setBlendMode(BLEND.OPAQUE);
      Render.drawGraph(_node, _cmpCamera, Render.drawNodeForRayCast);
      // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
      Render.setBlendMode(BLEND.TRANSPARENT);

      Render.resetFrameBuffer();
      return Render.pickBuffers;
    }
    /**
     * Draws the graph for picking starting with the given [[Node]] using the camera with extrem narrow focus [[ComponentCamera]].
     */
    public static drawGraphForPicking(_node: Node, _cmpCamera: ComponentCamera): Pick[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      Render.picks = [];
      // bind framebuffer and texture
      const framebuffer: WebGLFramebuffer = Render.crc3.createFramebuffer();
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
      const attachmentPoint: number = WebGL2RenderingContext.COLOR_ATTACHMENT0;
      Render.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, Render.pickTexture, 0);

      // draw nodes
      Render.drawGraph(_node, _cmpCamera, Render.drawNodeForPicking);

      let data: Uint8Array = new Uint8Array(Render.pickSize.x * Render.pickSize.y * 4);
      Render.crc3.readPixels(0, 0, Render.pickSize.x, Render.pickSize.x, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, data);

      for (let i: number = 0; i < Render.picks.length; i++) {
        let zBuffer: number = data[4 * i + 0] + data[4 * i + 1] / 256;
        Render.picks[i].zBuffer = zBuffer;
        Render.picks[i].alpha = data[4 * i + 2] / 255;
      }

      Render.resetFrameBuffer();
      return Render.picks;
    }

    /**
     * Browses through the buffers (previously created with [[drawGraphForRayCast]]) of the size given
     * and returns an unsorted list of the values at the given position, representing node-ids and depth information as [[RayHit]]s
     */
    public static pickNodeAt(_pos: Vector2, _pickBuffers: PickBuffer[], _rect: Rectangle): RayHit[] {
      let hits: RayHit[] = [];

      for (let pickBuffer of _pickBuffers) {
        Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, pickBuffer.frameBuffer);
        // TODO: instead of reading all data and afterwards pick the pixel, read only the pixel!
        let data: Uint8Array = new Uint8Array(_rect.width * _rect.height * 4);
        Render.crc3.readPixels(0, 0, _rect.width, _rect.height, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, data);
        let pixel: number = _pos.x + _rect.width * _pos.y;

        let zBuffer: number = data[4 * pixel + 1] + data[4 * pixel + 2] / 256;
        // let zBuffer: number = data[4 * pixel + 0];
        let hit: RayHit = new RayHit(pickBuffer.node, 0, zBuffer);

        hits.push(hit);
      }

      return hits;
    }
    //#endregion

    //#region Transformation & Lights
    /**
     * Recursively iterates over the graph starting with the node given, recalculates all world transforms, 
     * collects all lights and feeds all shaders used in the graph with these lights
     */
    public static setupTransformAndLights(_node: Node, _mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY(), _lights: MapLightTypeToLightList = new Map(), _shadersUsed: (typeof Shader)[] = null): void {
      Render.timestampUpdate = performance.now();
      let firstLevel: boolean = (_shadersUsed == null);
      if (firstLevel)
        _shadersUsed = [];

      let mtxWorld: Matrix4x4 = _mtxWorld;

      if (_node.cmpTransform)
        mtxWorld = Matrix4x4.MULTIPLICATION(_mtxWorld, _node.cmpTransform.local);

      _node.mtxWorld.set(mtxWorld); // overwrite readonly mtxWorld of node
      _node.timestampUpdate = Render.timestampUpdate;

      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      if (cmpMesh)  // TODO: careful when using particlesystem, pivot must not change node position
        cmpMesh.mtxWorld = Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);

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

      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      if (cmpMaterial) {
        let shader: typeof Shader = cmpMaterial.material.getShader();
        if (_shadersUsed.indexOf(shader) < 0)
          _shadersUsed.push(shader);
      }

      for (let child of _node.getChildren()) {
        Render.setupTransformAndLights(child, mtxWorld, _lights, _shadersUsed);
      }

      if (firstLevel)
        for (let shader of _shadersUsed)
          Render.setLightsInShader(shader, _lights);
    }
    //#endregion

    //#region Drawing
    /**
     * The main rendering function to be called from [[Viewport]].
     * Draws the graph starting with the given [[Node]] using the camera given [[ComponentCamera]].
     */
    public static drawGraph(_node: Node, _cmpCamera: ComponentCamera, _drawNode: Function = Render.drawNode): void {
      let mtxWorldToView: Matrix4x4 = _cmpCamera.mtxWorldToView;

      // TODO: Move physics rendering to RenderPhysics extension of RenderManager
      if (Physics.world && Physics.world.mainCam != _cmpCamera)
        Physics.world.mainCam = _cmpCamera; //DebugDraw needs to know the main camera beforehand, _cmpCamera is the viewport camera. | Marko Fehrenbach, HFU 2020
      Render.setupPhysicalTransform(_node);

      //if (Physics.settings && Physics.settings.debugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY) //Give users the possibility to only show physics displayed | Marko Fehrenbach, HFU 2020
      Render.drawGraphRecursive(_node, mtxWorldToView, _drawNode);

      if (Physics.settings && Physics.settings.debugDraw == true) {
        Physics.world.debugDraw.end();
      }
    }

    /**
     * Recursivly iterates over the graph and renders each node and all successors with the given render function
     */
    private static drawGraphRecursive(_node: Node, _mtxWorldToView: Matrix4x4, _drawNode: Function = Render.drawNode): void {
      // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      if (!_node.isActive)
        return;

      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      // if (cmpMesh) { // TODO: careful when using particlesystem, pivot must not change node position
      //   mtxMeshToWorld = Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);
      //   cmpMesh.mtxWorld = mtxMeshToWorld.copy;
      // }
      // else
      //   mtxMeshToWorld = _node.mtxWorld;

      if (cmpMesh && cmpMesh.isActive) {
        let mtxMeshToView: Matrix4x4 = Matrix4x4.MULTIPLICATION(_mtxWorldToView, cmpMesh.mtxWorld);
        // TODO: create drawNode method for particle system using _node.mtxWorld instead of finalTransform
        _drawNode(_node, _node.mtxWorld, mtxMeshToView);
        // RenderParticles.drawParticles();
        Recycler.store(mtxMeshToView);
      }

      for (let name in _node.getChildren()) {
        let childNode: Node = _node.getChildren()[name];
        Render.drawGraphRecursive(childNode, _mtxWorldToView, _drawNode); //, world);
      }
    }

    /**
     * The standard render function for drawing a single node
     */
    private static drawNode(_node: Node, _mtxMeshToWorld: Matrix4x4, _mtxWorldToView: Matrix4x4, _lights: MapLightTypeToLightList, _cmpCamera: ComponentCamera): void {
      try {
        let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
        if (!cmpMaterial.isActive) return;
        let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
        // RenderManager.setLightsInShader(shader, _lights);
        Render.draw(mesh, cmpMaterial, _mtxMeshToWorld, _mtxWorldToView); //, _lights);
      } catch (_error) {
        // Debug.error(_error);
      }
      //Should be drawn only once, last after anything else, which i believe it does because graphic card only draws each pixel in a certain depth once | Marko Fehrenbach
      // if (Physics.settings.debugDraw == true) {
      //   Physics.world.debugDraw.end();
      // }
    }
    //#endregion

    //#region Picking
    /**
    * The render function for picking. 
    * A cameraprojection with extremely narrow focus is used, so each pixel of the buffer would hold the same information from the node,  
    * but the fragemnt shader renders only 1 pixel for each node into the render buffer, 1st node to 1st pixel, 2nd node to second pixel etc.
    */
    private static drawNodeForPicking(_node: Node, _mtxMeshToWorld: Matrix4x4, _mtxWorldToView: Matrix4x4, _lights: MapLightTypeToLightList): void { // create Texture to render to, int-rgba
      try {
        let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial)
        let coat: Coat = cmpMaterial.material.getCoat();

        if (_node.getComponent(ComponentMaterial).material.getCoat() instanceof CoatTextured) {
          ShaderPickTextured.useProgram();
          coat.useRenderData(ShaderPickTextured, cmpMaterial);
        }
        else {
          ShaderPick.useProgram();
          coat.useRenderData(ShaderPick, cmpMaterial);
        }


        let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
        mesh.useRenderBuffers(ShaderPick, _mtxMeshToWorld, _mtxWorldToView, Render.picks.length);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        let pick: Pick = { node: _node, zBuffer: Infinity, alpha: 1.0 };
        Render.picks.push(pick);
      } catch (_error) {
        //
      }
    }

    /**
     * The render function for drawing buffers for picking. Renders each node on a dedicated buffer with id and depth values instead of colors
     */
    private static drawNodeForRayCast(_node: Node, _mtxMeshToWorld: Matrix4x4, _mtxWorldToView: Matrix4x4, _lights: MapLightTypeToLightList): void { // create Texture to render to, int-rgba
      // TODO: look into SSBOs!
      let target: WebGLTexture = Render.createPickTexture(Render.getRenderRectangle().width, Render.getRenderRectangle().height);

      const framebuffer: WebGLFramebuffer = Render.crc3.createFramebuffer();
      // render to our targetTexture by binding the framebuffer
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
      // attach the texture as the first color attachment
      const attachmentPoint: number = WebGL2RenderingContext.COLOR_ATTACHMENT0;
      Render.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, target, 0);

      try {
        let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
        ShaderRayCast.useProgram();
        let pickBuffer: PickBuffer = { node: _node, frameBuffer: framebuffer };
        Render.pickBuffers.push(pickBuffer);
        mesh.useRenderBuffers(ShaderRayCast, _mtxMeshToWorld, _mtxWorldToView, Render.pickBuffers.length);

        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      } catch (_error) {
        //
      }
    }
    //#endregion

    //#region Lights
    /**
     * Set light data in shaders
     */
    private static setLightsInShader(_shader: typeof Shader, _lights: MapLightTypeToLightList): void {
      _shader.useProgram();
      let uni: { [name: string]: WebGLUniformLocation } = _shader.uniforms;

      // Ambient
      let ambient: WebGLUniformLocation = uni["u_ambient.color"];
      if (ambient) {
        let cmpLights: ComponentLight[] = _lights.get(LightAmbient);
        if (cmpLights) {
          // TODO: add up ambient lights to a single color
          let result: Color = new Color(0, 0, 0, 1);
          for (let cmpLight of cmpLights)
            result.add(cmpLight.light.color);
          RenderWebGL.crc3.uniform4fv(ambient, result.getArray());
        }
      }

      // Directional
      let nDirectional: WebGLUniformLocation = uni["u_nLightsDirectional"];
      if (nDirectional) {
        let cmpLights: ComponentLight[] = _lights.get(LightDirectional);
        if (cmpLights) {
          let n: number = cmpLights.length;
          RenderWebGL.crc3.uniform1ui(nDirectional, n);
          for (let i: number = 0; i < n; i++) {
            let cmpLight: ComponentLight = cmpLights[i];
            RenderWebGL.crc3.uniform4fv(uni[`u_directional[${i}].color`], cmpLight.light.color.getArray());
            let direction: Vector3 = Vector3.Z();
            direction.transform(cmpLight.pivot, false);
            direction.transform(cmpLight.getContainer().mtxWorld);
            RenderWebGL.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
          }
        }
      }
    }
    //#endregion

    //#region Physics
    /**
    * Physics Part -> Take all nodes with cmpRigidbody, and overwrite their local position/rotation with the one coming from 
    * the rb component, which is the new "local" WORLD position.
    */
    private static setupPhysicalTransform(_node: Node): void {
      if (Physics.world != null && Physics.world.getBodyList().length >= 1) {
        let mutator: Mutator = {};
        for (let name in _node.getChildren()) {
          let childNode: Node = _node.getChildren()[name];
          Render.setupPhysicalTransform(childNode);
          let cmpRigidbody: ComponentRigidbody = childNode.getComponent(ComponentRigidbody);
          if (childNode.getComponent(ComponentTransform) != null && cmpRigidbody != null) {
            cmpRigidbody.checkCollisionEvents();
            cmpRigidbody.checkTriggerEvents();
            if (cmpRigidbody.physicsType != PHYSICS_TYPE.KINEMATIC) { //Case of Dynamic/Static Rigidbody
              //Override any position/rotation, Physical Objects do not know hierachy unless it's established through physics
              mutator["rotation"] = cmpRigidbody.getRotation();
              mutator["translation"] = cmpRigidbody.getPosition();
              childNode.mtxLocal.mutate(mutator);
            }
            if (cmpRigidbody.physicsType == PHYSICS_TYPE.KINEMATIC) { //Case of Kinematic Rigidbody
              cmpRigidbody.setPosition(childNode.mtxWorld.translation);
              cmpRigidbody.setRotation(childNode.mtxWorld.rotation);
            }
          }
        }
      }
    }
    //#endregion
  }
}