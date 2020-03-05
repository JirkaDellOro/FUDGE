// / <reference path="RenderOperator.ts"/>
namespace FudgeCore {
  interface NodeReferences {
    shader: typeof Shader;
    // coat: Coat;
    mesh: Mesh;
    // doneTransformToWorld: boolean;
  }
  type MapNodeToNodeReferences = Map<Node, NodeReferences>;

  export interface PickBuffer {
    node: Node;
    texture: WebGLTexture;
    frameBuffer: WebGLFramebuffer;
  }

  /**
   * This class manages the references to render data used by nodes.
   * Multiple nodes may refer to the same data via their references to shader, coat and mesh 
   */
  class Reference<T> {
    private reference: T;
    private count: number = 0;

    constructor(_reference: T) {
      this.reference = _reference;
    }

    public getReference(): T {
      return this.reference;
    }

    public increaseCounter(): number {
      this.count++;
      return this.count;
    }
    public decreaseCounter(): number {
      if (this.count == 0) throw (new Error("Negative reference counter"));
      this.count--;
      return this.count;
    }
  }

  /**
   * Manages the handling of the ressources that are going to be rendered by [[RenderOperator]].
   * Stores the references to the shader, the coat and the mesh used for each node registered. 
   * With these references, the already buffered data is retrieved when rendering.
   */
  export abstract class RenderManager extends RenderOperator {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    /** Stores references to the compiled shader programs and makes them available via the references to shaders */
    private static renderShaders: Map<typeof Shader, Reference<RenderShader>> = new Map();
    /** Stores references to the vertex array objects and makes them available via the references to coats */
    // private static renderCoats: Map<Coat, Reference<RenderCoat>> = new Map();
    /** Stores references to the vertex buffers and makes them available via the references to meshes */
    private static renderBuffers: Map<Mesh, Reference<RenderBuffers>> = new Map();
    private static nodes: MapNodeToNodeReferences = new Map();
    private static timestampUpdate: number;
    private static pickBuffers: PickBuffer[];

    // #region Adding
    /**
     * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
     * @param _node 
     */
    public static addNode(_node: Node): void {
      if (RenderManager.nodes.get(_node))
        return;

      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      if (!cmpMaterial)
        return;

      let shader: typeof Shader = cmpMaterial.material.getShader();
      RenderManager.createReference<typeof Shader, RenderShader>(RenderManager.renderShaders, shader, RenderManager.createProgram);

      // let coat: Coat = cmpMaterial.material.getCoat();
      // RenderManager.createReference<Coat, RenderCoat>(RenderManager.renderCoats, coat, RenderManager.createParameter);

      let mesh: Mesh = (<ComponentMesh>_node.getComponent(ComponentMesh)).mesh;
      RenderManager.createReference<Mesh, RenderBuffers>(RenderManager.renderBuffers, mesh, RenderManager.createBuffers);
      mesh.createRenderBuffers(null);

      // TODO: buffers for shaders, coats and meshes must be referenced by the nodes components/referenced instances directly!
      let nodeReferences: NodeReferences = { shader: shader, /*coat: coat,*/ mesh: mesh }; //, doneTransformToWorld: false };
      RenderManager.nodes.set(_node, nodeReferences);
    }

    /**
     * Register the node and its valid successors in the branch for rendering using [[addNode]]
     * @param _node 
     * @returns false, if the given node has a current timestamp thus having being processed during latest RenderManager.update and no addition is needed
     */
    public static addBranch(_node: Node): boolean {
      // TODO: rethink optimization!!
      // if (_node.isUpdated(RenderManager.timestampUpdate))
      //     return false;
      for (let node of _node.branch)
        try {
          // may fail when some components are missing. TODO: cleanup
          RenderManager.addNode(node);
        } catch (_error) {
          Debug.log(_error);
        }
      return true;
    }
    // #endregion

    // #region Removing
    /**
     * Unregister the node so that it won't be rendered any more. Decrease the render-data references and delete the node reference.
     * @param _node 
     */
    public static removeNode(_node: Node): void {
      let nodeReferences: NodeReferences = RenderManager.nodes.get(_node);
      if (!nodeReferences)
        return;

      RenderManager.removeReference<typeof Shader, RenderShader>(RenderManager.renderShaders, nodeReferences.shader, RenderManager.deleteProgram);
      // RenderManager.removeReference<Coat, RenderCoat>(RenderManager.renderCoats, nodeReferences.coat, RenderManager.deleteParameter);
      RenderManager.removeReference<Mesh, RenderBuffers>(RenderManager.renderBuffers, nodeReferences.mesh, RenderManager.deleteBuffers);

      RenderManager.nodes.delete(_node);
      
      nodeReferences.mesh.deleteRenderBuffers(null);
    }

    /**
     * Unregister the node and its valid successors in the branch to free renderer resources. Uses [[removeNode]]
     * @param _node 
     */
    public static removeBranch(_node: Node): void {
      for (let node of _node.branch)
        RenderManager.removeNode(node);
    }
    // #endregion

    // #region Updating
    /**
     * Reflect changes in the node concerning shader, coat and mesh, manage the render-data references accordingly and update the node references
     * @param _node
     */
    public static updateNode(_node: Node): void {
      let nodeReferences: NodeReferences = RenderManager.nodes.get(_node);
      if (!nodeReferences)
        return;

      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);

      let shader: typeof Shader = cmpMaterial.material.getShader();
      if (shader !== nodeReferences.shader) {
        RenderManager.removeReference<typeof Shader, RenderShader>(RenderManager.renderShaders, nodeReferences.shader, RenderManager.deleteProgram);
        RenderManager.createReference<typeof Shader, RenderShader>(RenderManager.renderShaders, shader, RenderManager.createProgram);
        nodeReferences.shader = shader;
      }

      // let coat: Coat = cmpMaterial.material.getCoat();
      // if (coat !== nodeReferences.coat) {
      //   RenderManager.removeReference<Coat, RenderCoat>(RenderManager.renderCoats, nodeReferences.coat, RenderManager.deleteParameter);
      //   RenderManager.createReference<Coat, RenderCoat>(RenderManager.renderCoats, coat, RenderManager.createParameter);
      //   nodeReferences.coat = coat;
      // }

      let mesh: Mesh = (<ComponentMesh>(_node.getComponent(ComponentMesh))).mesh;
      if (mesh !== nodeReferences.mesh) {
        RenderManager.removeReference<Mesh, RenderBuffers>(RenderManager.renderBuffers, nodeReferences.mesh, RenderManager.deleteBuffers);
        RenderManager.createReference<Mesh, RenderBuffers>(RenderManager.renderBuffers, mesh, RenderManager.createBuffers);
        nodeReferences.mesh = mesh;
      }
    }

    /**
     * Update the node and its valid successors in the branch using [[updateNode]]
     * @param _node 
     */
    public static updateBranch(_node: Node): void {
      for (let node of _node.branch)
        RenderManager.updateNode(node);
    }
    // #endregion

    // #region Lights
    /**
     * Viewports collect the lights relevant to the branch to render and calls setLights to pass the collection.  
     * RenderManager passes it on to all shaders used that can process light
     * @param _lights
     */
    public static setLights(_lights: MapLightTypeToLightList): void {
      // let renderLights: RenderLights = RenderManager.createRenderLights(_lights);
      for (let entry of RenderManager.renderShaders) {
        let renderShader: RenderShader = entry[1].getReference();
        RenderManager.setLightsInShader(renderShader, _lights);
      }
      // debugger;
    }
    // #endregion

    // #region Rendering
    /**
     * Update all render data. After RenderManager, multiple viewports can render their associated data without updating the same data multiple times
     */
    public static update(): void {
      RenderManager.timestampUpdate = performance.now();
      RenderManager.recalculateAllNodeTransforms();
    }

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
    public static drawBranch(_node: Node, _cmpCamera: ComponentCamera, _drawNode: Function = RenderManager.drawNode): void { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      if (!_node.isActive)
        return;
      if (_drawNode == RenderManager.drawNode)
        RenderManager.resetFrameBuffer();

      let finalTransform: Matrix4x4;

      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      if (cmpMesh)
        finalTransform = Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);
      else
        finalTransform = _node.mtxWorld; // caution, RenderManager is a reference...

      // multiply camera matrix
      let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);

      _drawNode(_node, finalTransform, projection);

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
      if (!RenderManager.renderShaders.get(ShaderRayCast))
        RenderManager.createReference<typeof Shader, RenderShader>(RenderManager.renderShaders, ShaderRayCast, RenderManager.createProgram);

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


    private static drawNode(_node: Node, _finalTransform: Matrix4x4, _projection: Matrix4x4): void {
      let references: NodeReferences = RenderManager.nodes.get(_node);
      if (!references)
        return; 
        
      let coat: Coat = _node.getComponent(ComponentMaterial).material.getCoat();
      let shaderInfo: RenderShader = RenderManager.renderShaders.get(references.shader).getReference();
      RenderManager.draw(shaderInfo, references.mesh, coat, _finalTransform, _projection);
      // RenderManager.draw(shaderInfo, bufferInfo, coatInfo, _finalTransform, _projection);
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

      let references: NodeReferences = RenderManager.nodes.get(_node);
      if (!references)
        return; // TODO: deal with partial references

      let pickBuffer: PickBuffer = { node: _node, texture: target, frameBuffer: framebuffer };
      RenderManager.pickBuffers.push(pickBuffer);

      let renderShader: RenderShader = RenderOperator.renderShaderRayCast;
      RenderOperator.useProgram(renderShader);
      references.mesh.useRenderBuffers(renderShader, _finalTransform, _projection, RenderManager.pickBuffers.length);

      RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, references.mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

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

    //#region Transformation of branch
    /**
     * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
     */
    private static recalculateAllNodeTransforms(): void {
      // inner function to be called in a for each node at the bottom of RenderManager function
      // function markNodeToBeTransformed(_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences): void {
      //     _nodeReferences.doneTransformToWorld = false;
      // }

      // inner function to be called in a for each node at the bottom of RenderManager function
      let recalculateBranchContainingNode: (_r: NodeReferences, _n: Node, _m: MapNodeToNodeReferences) => void = (_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences) => {
        // find uppermost ancestor not recalculated yet
        let ancestor: Node = _node;
        let parent: Node;
        while (true) {
          parent = ancestor.getParent();
          if (!parent)
            break;
          if (_node.isUpdated(RenderManager.timestampUpdate))
            break;
          ancestor = parent;
        }
        // TODO: check if nodes without meshes must be registered

        // use the ancestors parent world matrix to start with, or identity if no parent exists or it's missing a ComponenTransform
        let matrix: Matrix4x4 = Matrix4x4.IDENTITY();
        if (parent)
          matrix = parent.mtxWorld;

        // start recursive recalculation of the whole branch starting from the ancestor found
        RenderManager.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
      };

      // call the functions above for each registered node
      // RenderManager.nodes.forEach(markNodeToBeTransformed);
      RenderManager.nodes.forEach(recalculateBranchContainingNode);
    }

    /**
     * Recursive method receiving a childnode and its parents updated world transform.  
     * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
     * @param _node 
     * @param _world 
     */
    private static recalculateTransformsOfNodeAndChildren(_node: Node, _world: Matrix4x4): void {
      let world: Matrix4x4 = _world;
      let cmpTransform: ComponentTransform = _node.cmpTransform;
      if (cmpTransform)
        world = Matrix4x4.MULTIPLICATION(_world, cmpTransform.local);

      _node.mtxWorld = world;
      _node.timestampUpdate = RenderManager.timestampUpdate;

      for (let child of _node.getChildren()) {
        RenderManager.recalculateTransformsOfNodeAndChildren(child, world);
      }
    }
    // #endregion

    // #region Manage references to render data
    /**
     * Removes a reference to a program, parameter or buffer by decreasing its reference counter and deleting it, if the counter reaches 0
     * @param _in 
     * @param _key 
     * @param _deletor 
     */
    private static removeReference<KeyType, ReferenceType>(_in: Map<KeyType, Reference<ReferenceType>>, _key: KeyType, _deletor: Function): void {
      let reference: Reference<ReferenceType>;
      reference = _in.get(_key);
      if (reference.decreaseCounter() == 0) {
        // The following deletions may be an optimization, not necessary to start with and maybe counterproductive.
        // If data should be used later again, it must then be reconstructed...
        _deletor(reference.getReference());
        _in.delete(_key);
      }
    }

    /**
     * Increases the counter of the reference to a program, parameter or buffer. Creates the reference, if it's not existent.
     * @param _in 
     * @param _key 
     * @param _creator 
     */
    private static createReference<KeyType, ReferenceType>(_in: Map<KeyType, Reference<ReferenceType>>, _key: KeyType, _creator: Function): void {
      let reference: Reference<ReferenceType>;
      reference = _in.get(_key);
      if (reference)
        reference.increaseCounter();
      else {
        let content: ReferenceType = _creator(_key);
        reference = new Reference<ReferenceType>(content);
        reference.increaseCounter();
        _in.set(_key, reference);
      }
    }
    // #endregion
  }
}