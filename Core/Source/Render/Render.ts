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
    public static nodesPhysics: RecycableArray<Node> = new RecycableArray();
    public static componentsPick: RecycableArray<ComponentPick> = new RecycableArray();
    public static lights: MapLightTypeToLightList = new Map();
    private static nodesSimple: RecycableArray<Node> = new RecycableArray();
    private static nodesAlpha: RecycableArray<Node> = new RecycableArray();
    private static timestampUpdate: number;

    // TODO: research if picking should be optimized using radius picking to filter

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
        _branch.dispatchEvent(new Event(EVENT.RENDER_PREPARE_END));
        Render.fillLightsUBO(Render.lights);
      }
    }

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
    public static draw(_cmpCamera: ComponentCamera): void {
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

    private static drawList(_cmpCamera: ComponentCamera, _list: RecycableArray<Node> | Array<Node>): void {
      for (let node of _list) {
        Render.drawNode(node, _cmpCamera);
      }
    }

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
        { translation: _cmpRigidbody.getPosition(), rotation: _cmpRigidbody.getRotation(), scaling: null }
      );
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
