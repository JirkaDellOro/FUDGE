namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, RecycableArray<ComponentLight>>;

  export interface RenderPrepareOptions {
    ignorePhysics?: boolean;
    collectGizmos?: boolean;
  }

  /**
   * The main interface to the render engine, here WebGL (see superclass {@link RenderWebGL} and the RenderInjectors
   */
  export abstract class Render extends RenderWebGL {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    public static pickBuffer: Int32Array;   // TODO: research if picking should be optimized using radius picking to filter
    public static readonly nodesPhysics: RecycableArray<Node> = new RecycableArray();
    public static readonly componentsPick: RecycableArray<ComponentPick> = new RecycableArray();
    public static readonly lights: MapLightTypeToLightList = new Map();
    public static readonly gizmos: RecycableArray<Gizmo> = new RecycableArray();
    private static readonly nodesSimple: RecycableArray<Node> = new RecycableArray();
    private static readonly nodesAlpha: RecycableArray<Node> = new RecycableArray();
    private static readonly componentsSkeleton: RecycableArray<ComponentSkeleton> = new RecycableArray();
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
        Render.componentsSkeleton.reset();
        Render.lights.forEach(_array => _array.reset());
        if (_options?.collectGizmos)
          Render.gizmos.reset();
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
        if (cmpMaterial.sortForAlpha || _branch.getComponent(ComponentText)) // always sort text for alpha
          Render.nodesAlpha.push(_branch); // add this node to render list
        else
          Render.nodesSimple.push(_branch); // add this node to render list
      }

      let cmpSkeletons: ComponentSkeleton[] = _branch.getComponents(ComponentSkeleton);
      for (let cmpSkeleton of cmpSkeletons)
        if (cmpSkeleton && cmpSkeleton.isActive)
          Render.componentsSkeleton.push(cmpSkeleton);

      if (_options?.collectGizmos) {
        for (const component of _branch.getAllComponents())
          if (component.isActive && Gizmos.filter.get(component.type))
            Render.gizmos.push(component);
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
        for (const cmpSkeleton of Render.componentsSkeleton) {
          cmpSkeleton.update();
          cmpSkeleton.updateRenderBuffer();
        }
        Render.bufferLights(Render.lights);
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
    public static pickBranch(_nodes: Node[], _cmpCamera: ComponentCamera, _pickGizmos: boolean = false): Pick[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      /**
       * TODO: maybe move this whole function to RenderWebGL? 
       * It seems to mostly rely on RenderWebGL e.g.: ƒpicked, createPickTexture(), setBlendMode(), pick(), pickGizmos(), getPicks(), resetFramebuffer()
       * They only not WebGL thing it does is filtering the nodes to pick, which could be done in pick() itself...
       * -> or make this method only collect the nodes and gizmos from branch and then pass them to an appropriate method in RenderWebGL?
       * 
       * Also {@link Render.ƒpicked} and {@link Render.sizePick} seem to only ever be used in the methods called from this method. 
       * sizePick gets set in createPickTexture() and used in pick() via the property but passed as an argument to getPicks().
       * ƒpicked is only used in getPicks(), pick() and pickGizmos() and only ever set to an empty array in this method.
       * -> both could be local variables and passed as arguments to the methods that need them.
       */ 
      Render.ƒpicked = [];
      let size: number = Math.ceil(Math.sqrt(_nodes.length + Render.gizmos.length)); // gizmos.length might be bigger than needed...
      Render.createPickTexture(size);
      Render.setBlendMode(BLEND.OPAQUE);

      let gizmos: Gizmo[] = [];

      for (let node of _nodes) {
        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let cmpMaterial: ComponentMaterial = node.getComponent(ComponentMaterial);
        if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive)
          Render.pick(node, _cmpCamera);

        if (_pickGizmos) {
          for (let gizmo of node.getAllComponents()) {
            if (!gizmo.isActive || !Gizmos.filter.get(gizmo.type) || !(<Gizmo>gizmo).drawGizmos)
              continue;
      
            gizmos.push(gizmo);
          }
        }
      }

      if (_pickGizmos)
        Render.pickGizmos(gizmos, _cmpCamera);

      Render.setBlendMode(BLEND.TRANSPARENT);

      let picks: Pick[] = Render.getPicks(size, _cmpCamera);
      Render.resetFramebuffer();
      return picks;
    }
    //#endregion

    //#region Drawing
    /**
     * Draws the scene from the point of view of the given camera
     */
    public static draw(_cmpCamera: ComponentCamera): void {
      for (let node of Render.nodesAlpha)
        Reflect.set(node, "zCamera", _cmpCamera.pointWorldToClip(node.getComponent(ComponentMesh).mtxWorld.translation).z);

      const sorted: Node[] = Render.nodesAlpha.getSorted((_a: Node, _b: Node) => Reflect.get(_b, "zCamera") - Reflect.get(_a, "zCamera"));

      Render.drawNodes(Render.nodesSimple, sorted, _cmpCamera);
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
