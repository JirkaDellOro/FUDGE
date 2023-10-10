namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, RecycableArray<ComponentLight>>;

  export interface RenderPrepareOptions {
    ignorePhysics?: boolean;
  }

  /**
   * The main interface to the render engine, here WebGL (see superclass {@link RenderWebGL} and the RenderInjectors
   */
  export abstract class Render extends RenderWebGL {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    public static pickBuffer: Int32Array;
    public static readonly nodesPhysics: RecycableArray<Node> = new RecycableArray();
    public static readonly componentsPick: RecycableArray<ComponentPick> = new RecycableArray();
    public static readonly lights: MapLightTypeToLightList = new Map();


    //Objects and variables used for post effects.
    public static mainFBO: WebGLFramebuffer;
    public static mainTexture: WebGLTexture;

    public static mistFBO: WebGLFramebuffer;
    public static mistTexture: WebGLTexture;
    public static cmpMistMaterial: ComponentMaterial;

    public static aoNormalFBO: WebGLFramebuffer;
    public static aoNormalTexture: WebGLTexture;
    public static aoDepthTexture: WebGLTexture;
    public static aoFBO: WebGLFramebuffer;
    public static aoTexture: WebGLTexture;
    public static aoSamplePoints: Vector3[] = [];
    public static cmpSmoothNormalMaterial: ComponentMaterial;
    public static cmpFlatNormalMaterial: ComponentMaterial;

    public static downsamplingDepth: number = 7;
    public static bloomDownsamplingFBOs: WebGLFramebuffer[] = [];
    public static bloomDownsamplingTextures: WebGLTexture[] = [];
    public static bloomUpsamplingFBOs: WebGLFramebuffer[] = [];
    public static bloomUpsamplingTextures: WebGLTexture[] = [];

    public static screenQuad: Float32Array;
    public static screenQuadUV: Float32Array;
    // TODO: research if picking should be optimized using radius picking to filter

    private static readonly nodesSimple: RecycableArray<Node> = new RecycableArray();
    private static readonly nodesAlpha: RecycableArray<Node> = new RecycableArray();
    private static readonly skeletons: RecycableArray<SkeletonInstance> = new RecycableArray();
    private static timestampUpdate: number;

    //#region Prepare
    /**
     * Recursively iterates over the branch starting with the node given, recalculates all world transforms, 
     * collects all lights and feeds all shaders used in the graph with these lights. Sorts nodes for different
     * render passes.
     */
    public static prepare(_branch: Node, _options: RenderPrepareOptions = {}, _mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY(), _shadersUsed: (ShaderInterface)[] = null): void {
      let firstLevel: boolean = (_shadersUsed == null);
      if (firstLevel) {
        _shadersUsed = [];
        Render.timestampUpdate = performance.now();
        Render.nodesSimple.reset();
        Render.nodesAlpha.reset();
        Render.nodesPhysics.reset();
        Render.componentsPick.reset();
        Render.skeletons.reset();
        Render.lights.forEach(_array => _array.reset());
        _branch.dispatchEvent(new Event(EVENT.RENDER_PREPARE_START));
      }

      if (!_branch.isActive)
        return; // don't add branch to render list if not active

      _branch.nNodesInBranch = 1;
      _branch.radius = 0;

      _branch.dispatchEventToTargetOnly(new Event(EVENT.RENDER_PREPARE));
      _branch.timestampUpdate = Render.timestampUpdate;

      if (_branch.cmpTransform && _branch.cmpTransform.isActive) {
        let mtxWorldBranch: Matrix4x4 = Matrix4x4.MULTIPLICATION(_mtxWorld, _branch.cmpTransform.mtxLocal);
        _branch.mtxWorld.set(mtxWorldBranch);
        Recycler.store(mtxWorldBranch);
      } else
        _branch.mtxWorld.set(_mtxWorld); // overwrite readonly mtxWorld of the current node

      let cmpRigidbody: ComponentRigidbody = _branch.getComponent(ComponentRigidbody);
      if (cmpRigidbody && cmpRigidbody.isActive) { //TODO: support de-/activation throughout
        Render.nodesPhysics.push(_branch); // add this node to physics list
        if (!_options?.ignorePhysics)
          this.transformByPhysics(_branch, cmpRigidbody);
      }

      let cmpPick: ComponentPick = _branch.getComponent(ComponentPick);
      if (cmpPick && cmpPick.isActive) {
        Render.componentsPick.push(cmpPick); // add this component to pick list
      }

      let cmpLights: ComponentLight[] = _branch.getComponents(ComponentLight);
      Render.addLights(cmpLights);

      let cmpMesh: ComponentMesh = _branch.getComponent(ComponentMesh);
      let cmpMaterial: ComponentMaterial = _branch.getComponent(ComponentMaterial);

      if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
        let mtxWorldMesh: Matrix4x4 = Matrix4x4.MULTIPLICATION(_branch.mtxWorld, cmpMesh.mtxPivot);
        cmpMesh.mtxWorld.set(mtxWorldMesh);
        Recycler.store(mtxWorldMesh); // TODO: examine, why recycling this causes meshes to be misplaced...
        let shader: ShaderInterface = cmpMaterial.material.getShader();
        let cmpParticleSystem: ComponentParticleSystem = _branch.getComponent(ComponentParticleSystem);
        if (cmpParticleSystem && cmpParticleSystem.isActive && cmpParticleSystem.particleSystem != null)
          shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);
        if (_shadersUsed.indexOf(shader) < 0)
          _shadersUsed.push(shader);
        _branch.radius = cmpMesh.radius;
        if (cmpMaterial.sortForAlpha)
          Render.nodesAlpha.push(_branch); // add this node to render list
        else
          Render.nodesSimple.push(_branch); // add this node to render list
      }

      if (_branch instanceof SkeletonInstance)
        Render.skeletons.push(_branch);

      for (let child of _branch.getChildren()) {
        Render.prepare(child, _options, _branch.mtxWorld, _shadersUsed);

        _branch.nNodesInBranch += child.nNodesInBranch;
        let cmpMeshChild: ComponentMesh = child.getComponent(ComponentMesh);
        let position: Vector3 = cmpMeshChild ? cmpMeshChild.mtxWorld.translation : child.mtxWorld.translation;
        position = position.clone;
        _branch.radius = Math.max(_branch.radius, position.getDistance(_branch.mtxWorld.translation) + child.radius);
        Recycler.store(position);
      }

      if (firstLevel) {
        for (const skeleton of Render.skeletons) {
          skeleton.calculateMtxBones();
          skeleton.updateRenderBuffer();
        }
        _branch.dispatchEvent(new Event(EVENT.RENDER_PREPARE_END));
        Render.updateLightsUBO(Render.lights);
      }
    }

    /**
     * Add the given lights to the {@link Render.lights}-map, sorted by type.
     */
    public static addLights(_cmpLights: ComponentLight[]): void {
      for (let cmpLight of _cmpLights) {
        if (!cmpLight.isActive)
          continue;

        let type: TypeOfLight = cmpLight.light.getType();
        let lightsOfType: RecycableArray<ComponentLight> = Render.lights.get(type);
        if (!lightsOfType) {
          lightsOfType = new RecycableArray<ComponentLight>();
          Render.lights.set(type, lightsOfType);
        }
        lightsOfType.push(cmpLight);
      }
    }
    //#endregion

    //#region Picking
    /**
     * Used with a {@link Picker}-camera, this method renders one pixel with picking information 
     * for each node in the line of sight and return that as an unsorted {@link Pick}-array
     */
    public static pickBranch(_nodes: Node[], _cmpCamera: ComponentCamera): Pick[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      Render.ƒpicked = [];
      let size: number = Math.ceil(Math.sqrt(_nodes.length));
      Render.createPickTexture(size);
      Render.setBlendMode(BLEND.OPAQUE);

      for (let node of _nodes) {
        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let cmpMaterial: ComponentMaterial = node.getComponent(ComponentMaterial);
        if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
          // let mtxMeshToView: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
          Render.pick(node, node.mtxWorld, _cmpCamera);
          // RenderParticles.drawParticles();
          // Recycler.store(mtxMeshToView);
        }
      }

      Render.setBlendMode(BLEND.TRANSPARENT);

      let picks: Pick[] = Render.getPicks(size, _cmpCamera);
      Render.resetFrameBuffer();
      return picks;
    }
    //#endregion

    //#region Drawing
    /**
     * Draws the scene from the point of view of the given camera
     */
    public static draw(_cmpCamera: ComponentCamera): void {
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, Render.mainFBO);
      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);
      Render.setDepthTest(true);
      Render.clear(_cmpCamera.clrBackground);

      _cmpCamera.resetWorldToView();

      Render.drawList(_cmpCamera, this.nodesSimple);
      Render.drawListAlpha(_cmpCamera);
    }

    private static drawListAlpha(_cmpCamera: ComponentCamera): void {
      function sort(_a: Node, _b: Node): number {
        return (Reflect.get(_a, "zCamera") < Reflect.get(_b, "zCamera")) ? 1 : -1;
      }
      for (let node of Render.nodesAlpha)
        Reflect.set(node, "zCamera", _cmpCamera.pointWorldToClip(node.getComponent(ComponentMesh).mtxWorld.translation).z);

      let sorted: Node[] = Render.nodesAlpha.getSorted(sort);
      Render.drawList(_cmpCamera, sorted);
    }
    /**
     * Draws a given list of nodes. A @param _cmpMat can be passed to render every node of the list with the same Material (useful for PostFX)
     */
    private static drawList(_cmpCamera: ComponentCamera, _list: RecycableArray<Node> | Array<Node>): void {
      for (let node of _list) {
        Render.drawNode(node, _cmpCamera);
      }
    }
    //#endregion

    //#region PostFX
    /**
     * Draws the necessary Buffers for AO-calculation and calculates the AO-Effect
     */
    public static calcAO(_cmpCamera: ComponentCamera, _cmpAO: ComponentAmbientOcclusion): void {

      this.calcNormalPass(_cmpCamera, _cmpAO);

      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, Render.aoFBO);              //set Framebuffer to AO-FBO
      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);
      Render.setDepthTest(false);
      Render.clear(new Color(1));
      _cmpCamera.resetWorldToView();

      //feed texture and uniform matrix
      function bindTexture(_texture: WebGLTexture, _texSlot: number, _texSlotNumber: number, _texVarName: string): void {
        RenderWebGL.crc3.activeTexture(_texSlot);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms[_texVarName], _texSlotNumber);
      }

      let shader: typeof Shader = ShaderAmbientOcclusion;
      shader.useProgram();
      Render.useScreenQuadRenderData(shader);

      this.feedAOUniforms(bindTexture, _cmpAO, _cmpCamera, shader)

      RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLE_STRIP, 0, 4);
    }

    protected static calcNormalPass(_cmpCamera: ComponentCamera, _cmpAO: ComponentAmbientOcclusion) {
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, Render.aoNormalFBO);
      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);
      Render.setDepthTest(true);
      Render.clear(new Color(1));
      _cmpCamera.resetWorldToView();

      //TODO: Also send the normalmap to the shader if the material has one. This could lead to even better AO.
      Render.drawNodesNormal(_cmpCamera, this.nodesSimple, _cmpAO);
      //TODO: Implement Normal Calculation for non or partially opaque materials
      Render.drawNodesNormal(_cmpCamera, this.nodesAlpha, _cmpAO);
    }

    protected static feedAOUniforms(_bindTexture: Function, _cmpAO: ComponentAmbientOcclusion, _cmpCamera: ComponentCamera, _shader: typeof Shader) {
      _bindTexture(Render.aoNormalTexture, WebGL2RenderingContext.TEXTURE0, 0, "u_normalTexture");
      _bindTexture(Render.aoDepthTexture, WebGL2RenderingContext.TEXTURE1, 1, "u_depthTexture");
      RenderWebGL.getRenderingContext().uniform1f(_shader.uniforms["u_nearPlane"], _cmpCamera.getNear());
      RenderWebGL.getRenderingContext().uniform1f(_shader.uniforms["u_farPlane"], _cmpCamera.getFar());
      RenderWebGL.getRenderingContext().uniform1f(_shader.uniforms["u_radius"], _cmpAO.radius);
      RenderWebGL.getRenderingContext().uniform1i(_shader.uniforms["u_nSamples"], _cmpAO.samples);
      RenderWebGL.getRenderingContext().uniform1f(_shader.uniforms["u_shadowDistance"], _cmpAO.shadowDistance);
      RenderWebGL.getRenderingContext().uniform1f(_shader.uniforms["u_width"], Render.crc3.canvas.width);
      RenderWebGL.getRenderingContext().uniform1f(_shader.uniforms["u_height"], Render.crc3.canvas.height);

      this.feedSamplePoints(_cmpAO.samples, _shader);
      this.feedNoiseTexture(_bindTexture);
    }

    protected static feedSamplePoints(_samples: number, _shader: typeof Shader) {
      if (_samples != Render.aoSamplePoints.length) {
        RenderWebGL.generateNewSamplePoints(_samples);
      }
      let uni: { [name: string]: WebGLUniformLocation } = _shader.uniforms;
      let i: number = 0;
      for (let sample of Render.aoSamplePoints) {
        RenderWebGL.getRenderingContext().uniform3fv(uni[`u_samples[${i}].vct`], new Float32Array([sample.x, sample.y, sample.z]));
        i++;
      }
    }

    protected static feedNoiseTexture(_bindTexture: Function) {
      let noiseTex: WebGLTexture = RenderWebGL.getRenderingContext().createTexture();
      let pixelInformation: Uint8Array = new Uint8Array(100); //100 values are needed to get a 5 by 5 texture with 4 color channels
      for (let i: number = 0; i < 100 * 4; i++) {
        pixelInformation[i] = Math.floor(Math.random() * 256);
      }
      _bindTexture(noiseTex, WebGL2RenderingContext.TEXTURE2, 2, "u_noiseTexture");
      RenderWebGL.getRenderingContext().texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, 5, 5, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, pixelInformation);
      RenderWebGL.getRenderingContext().texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
      RenderWebGL.getRenderingContext().texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
      RenderWebGL.getRenderingContext().texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
      RenderWebGL.getRenderingContext().texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
    }

    /**
    * Calculates the mist-effect
     */
    public static calcMist(_cmpCamera: ComponentCamera, _cmpMist: ComponentMist): void {
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, Render.mistFBO);
      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);
      Render.setDepthTest(true);
      Render.clear(new Color(1));

      _cmpCamera.resetWorldToView();

      Render.drawNodesMist(_cmpCamera, this.nodesSimple, _cmpMist);
      //TODO: Implement alpha-mist-calculation. For now they are drawn fully opaque
      Render.drawNodesMist(_cmpCamera, this.nodesAlpha, _cmpMist);
    }

    /**
    * Calculates the bloom-effect
     */
    public static calcBloom(_cmpBloom: ComponentBloom): void {

      //feed texture and uniform matrix in textureslot 0
      function bindTextureSlot0(_texture: WebGLTexture): void {
        RenderWebGL.crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms["u_texture"], 0);
      }
      //feed texture and uniform matrix in textureslot 1
      function bindTextureSlot1(_texture: WebGLTexture): void {
        RenderWebGL.crc3.activeTexture(WebGL2RenderingContext.TEXTURE1);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms["u_texture2"], 1);
      }

      let tempTexture: WebGLTexture = Render.mainTexture;   //Temporary texture that gets progressively smaller while downsampling.
      let div: number = 2;                                  //Divider that is increased x2 every next downsampling-stage

      let shader: typeof Shader = ShaderDownsample;
      shader.useProgram();
      Render.useScreenQuadRenderData(shader);               //set a rectangle that spans the whole renderarea for the texture to be rendered on

      //Downsampling
      for (let i: number = 0; i < Render.bloomDownsamplingFBOs.length; i++) {
        let width: number = Math.max(Render.crc3.canvas.width / div, 1);
        let height: number = Math.max(Render.crc3.canvas.height / div, 1);

        Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, Render.bloomDownsamplingFBOs[i]);
        Render.crc3.viewport(0, 0, Math.round(width), Math.round(height));
        Render.clear(new Color(0, 0, 0, 1));

        bindTextureSlot0(tempTexture);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_width"], width * 2);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_height"], height * 2);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_threshold"], _cmpBloom.threshold);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_lvl"], i);
        RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLE_STRIP, 0, 4);

        tempTexture = Render.bloomDownsamplingTextures[i];      //set the new destinationTexture to be rendered on in the next pass
        div *= 2;
      }

      shader = ShaderUpsample;                    //switch the shader to the upsampling shader
      shader.useProgram();
      Render.useScreenQuadRenderData(shader);
      div /= 4;

      //Upsampling and combining Downsamplingpasses
      for (let i: number = Render.bloomUpsamplingFBOs.length - 1; i >= 0; i--) {
        let width: number = Math.max(Render.crc3.canvas.width / div, 1);
        let height: number = Math.max(Render.crc3.canvas.height / div, 1);

        Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, Render.bloomUpsamplingFBOs[i]);
        Render.crc3.viewport(0, 0, Math.round(width), Math.round(height));
        Render.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);

        bindTextureSlot0(tempTexture);
        bindTextureSlot1(this.bloomDownsamplingTextures[i]);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_width"], Math.min(width / 2));
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_height"], Math.min(height / 2));

        RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLE_STRIP, 0, 4);

        tempTexture = Render.bloomUpsamplingTextures[i];
        div /= 2;
      }

    }

    /**
    * Sets up the "ScreenQuad" that is used to render a texture over the whole screen area
     */
    public static initScreenQuad(_texture: WebGLTexture): void {
      Render.screenQuad = new Float32Array([
        //Vertex coordinates (no third dimension needed);
        -1.0, 1.0,
        -1.0, -1.0,
        1.0, 1.0,
        1.0, -1.0,
      ]);
      Render.screenQuadUV = new Float32Array([
        //Texture coordinates 
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
      ]);
    }

    /**
    * Sets all necessary data in the shader for the screen quad to be rendered on
     */
    public static useScreenQuadRenderData(_shader: typeof Shader): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      function createBuffer(_type: GLenum, _array: Float32Array): WebGLBuffer {
        let buffer: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
        crc3.bindBuffer(_type, buffer);
        crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
        return buffer;
      }

      //feed in vertex coordinates if shader accepts a_vctPosition
      let attribute: number = _shader.attributes["a_vctPosition"];
      if (typeof attribute !== "undefined") {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Render.screenQuad));
        crc3.enableVertexAttribArray(attribute);
        crc3.vertexAttribPointer(attribute, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      // feed in texture coordinates if shader accepts a_vctTexture
      let texAttribute: number = _shader.attributes["a_vctTexture"];
      if (texAttribute) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, Render.screenQuadUV));
        crc3.enableVertexAttribArray(texAttribute);
        crc3.vertexAttribPointer(texAttribute, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }
    }

    //#endregion

    //#region Physics
    private static transformByPhysics(_node: Node, _cmpRigidbody: ComponentRigidbody): void {
      if (!_cmpRigidbody.isInitialized) // || Project.mode == MODE.EDITOR)
        _cmpRigidbody.initialize();

      if (!Physics.getBodyList().length)
        return;

      if (!_node.mtxLocal) {
        throw (new Error("ComponentRigidbody requires ComponentTransform at the same Node"));
      }

      _cmpRigidbody.checkCollisionEvents();

      if (_cmpRigidbody.typeBody == BODY_TYPE.KINEMATIC || Project.mode == MODE.EDITOR) { //Case of Kinematic Rigidbody
        let mtxPivotWorld: Matrix4x4 = Matrix4x4.MULTIPLICATION(_node.mtxWorld, _cmpRigidbody.mtxPivotUnscaled);
        _cmpRigidbody.setPosition(mtxPivotWorld.translation);
        _cmpRigidbody.setRotation(mtxPivotWorld.rotation);
        Recycler.store(mtxPivotWorld);
        return;
      }

      let mtxWorld: Matrix4x4 = Matrix4x4.CONSTRUCTION(
        _cmpRigidbody.getPosition(), _cmpRigidbody.getRotation(), null);
      mtxWorld.multiply(_cmpRigidbody.mtxPivotInverse);
      _node.mtxWorld.translation = mtxWorld.translation;
      _node.mtxWorld.rotation = mtxWorld.rotation;
      let mtxLocal: Matrix4x4 = _node.getParent() ? Matrix4x4.RELATIVE(_node.mtxWorld, _node.getParent().mtxWorld) : _node.mtxWorld;
      _node.mtxLocal.set(mtxLocal);
      Recycler.store(mtxWorld);
      Recycler.store(mtxLocal);
    }
    //#endregion
  }
}
