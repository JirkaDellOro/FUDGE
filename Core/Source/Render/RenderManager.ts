namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, ComponentLight[]>;

  /**
   * Rendered texture for each node for picking
   */
  export interface PickBuffer {
    node: Node;
    texture: WebGLTexture;
    frameBuffer: WebGLFramebuffer;
  }

  /**
   * The main interface to the render engine, here WebGL, which is used mainly in the superclass [[RenderOperator]]
   */
  export abstract class RenderManager extends RenderOperator {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    private static timestampUpdate: number;
    private static pickBuffers: PickBuffer[];

    /**
     * Clear the offscreen renderbuffer with the given [[Color]]
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

    //#region RayCast & Picking
    /**
     * Draws the graph for RayCasting starting with the given [[Node]] using the camera given [[ComponentCamera]].
     */
    public static drawGraphForRayCast(_node: Node, _cmpCamera: ComponentCamera): PickBuffer[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      RenderManager.pickBuffers = [];
      //TODO: examine, why switching blendFunction is necessary 
      RenderOperator.crc3.blendFunc(1, 0);
      RenderManager.drawGraph(_node, _cmpCamera, RenderManager.drawNodeForRayCast);
      RenderOperator.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);

      RenderManager.resetFrameBuffer();
      return RenderManager.pickBuffers;
    }

    /**
     * Browses through the buffers (previously created with [[drawGraphForRayCast]]) of the size given
     * and returns an unsorted list of the values at the given position, representing node-ids and depth information as [[RayHit]]s
     */
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
    //#endregion

    //#region Drawing
    /**
     * The main rendering function to be called from [[Viewport]].
     * Draws the graph starting with the given [[Node]] using the camera given [[ComponentCamera]].
     */
    public static drawGraph(_node: Node, _cmpCamera: ComponentCamera, _drawNode: Function = RenderManager.drawNode): void {
      let matrix: Matrix4x4 = Matrix4x4.IDENTITY();
      if (_node.getParent())
        matrix = _node.getParent().mtxWorld;

      RenderManager.setupPhysicalTransform(_node);

      RenderManager.setupTransformAndLights(_node, matrix);

      RenderManager.drawGraphRecursive(_node, _cmpCamera, _drawNode);
    }

    /**
     * Recursivly iterates over the graph and renders each node and all successors with the given render function
     */
    private static drawGraphRecursive(_node: Node, _cmpCamera: ComponentCamera, _drawNode: Function = RenderManager.drawNode): void {
      // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      if (!_node.isActive)
        return;

      let finalTransform: Matrix4x4;

      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      if (cmpMesh) // TODO: careful when using particlesystem, pivot must not change node position
        finalTransform = Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);
      else
        finalTransform = _node.mtxWorld; // caution, RenderManager is a reference...

      // multiply camera matrix
      let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);

      // TODO: create drawNode method for particle system using _node.mtxWorld instead of finalTransform
      _drawNode(_node, finalTransform, projection);
      // RenderParticles.drawParticles();

      for (let name in _node.getChildren()) {
        let childNode: Node = _node.getChildren()[name];
        RenderManager.drawGraphRecursive(childNode, _cmpCamera, _drawNode); //, world);
      }

      Recycler.store(projection);
      if (finalTransform != _node.mtxWorld)
        Recycler.store(finalTransform);
    }

    /**
     * The standard render function for drawing a single node
     */
    private static drawNode(_node: Node, _finalTransform: Matrix4x4, _projection: Matrix4x4, _lights: MapLightTypeToLightList): void {
      try {
        let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
        let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
        // RenderManager.setLightsInShader(shader, _lights);
        RenderManager.draw(mesh, cmpMaterial, _finalTransform, _projection); //, _lights);
      } catch (_error) {
        // Debug.error(_error);
      }
      //DRAW PHYSICS DEBUG
    }
    //#endregion

    //#region Picking
    /**
     * The render function for drawing buffers for picking. Renders each node on a dedicated buffer with id and depth values instead of colors
     */
    private static drawNodeForRayCast(_node: Node, _finalTransform: Matrix4x4, _projection: Matrix4x4, _lights: MapLightTypeToLightList): void { // create Texture to render to, int-rgba
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

    /**
     * Creates a texture buffer to be uses as pick-buffer
     */
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

    //#region Transformation & Lights
    /**
     * Recursively iterates over the graph starting with the node given, recalculates all world transforms, 
     * collects all lights and feeds all shaders used in the graph with these lights
     */
    public static setupTransformAndLights(_node: Node, _world: Matrix4x4 = Matrix4x4.IDENTITY(), _lights: MapLightTypeToLightList = new Map(), _shadersUsed: (typeof Shader)[] = null): void {
      let firstLevel: boolean = (_shadersUsed == null);
      if (firstLevel)
        _shadersUsed = [];

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

      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      if (cmpMaterial) {
        let shader: typeof Shader = cmpMaterial.material.getShader();
        if (_shadersUsed.indexOf(shader) < 0)
          _shadersUsed.push(shader);
      }

      for (let child of _node.getChildren()) {
        RenderManager.setupTransformAndLights(child, world, _lights, _shadersUsed);
      }

      if (firstLevel)
        for (let shader of _shadersUsed)
          RenderManager.setLightsInShader(shader, _lights);
    }

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
          RenderOperator.crc3.uniform4fv(ambient, result.getArray());
        }
      }

      // Directional
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
            direction.transform(cmpLight.pivot, false);
            direction.transform(cmpLight.getContainer().mtxWorld);
            RenderOperator.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
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
          RenderManager.setupPhysicalTransform(childNode);
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