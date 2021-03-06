namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, ComponentLight[]>;

  /**
   * The main interface to the render engine, here WebGL (see superclass [[RenderWebGL]] and the RenderInjectors
   */
  export abstract class Render extends RenderWebGL {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    public static pickBuffer: Int32Array;
    private static timestampUpdate: number;
    private static nodesSimple: RecycableArray<Node> = new RecycableArray();
    private static nodesAlpha: RecycableArray<Node> = new RecycableArray();

    // TODO: research if picking should be optimized using radius picking to filter

    //#region Prepare
    /**
     * Recursively iterates over the branch starting with the node given, recalculates all world transforms, 
     * collects all lights and feeds all shaders used in the graph with these lights. Sorts nodes for different
     * render passes.
     */
    public static prepare(_branch: Node, _mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY(), _lights: MapLightTypeToLightList = new Map(), _shadersUsed: (typeof Shader)[] = null): void {

      let firstLevel: boolean = (_shadersUsed == null);
      if (firstLevel) {
        _shadersUsed = [];
        Render.timestampUpdate = performance.now();
        Render.nodesSimple.reset();
        Render.nodesAlpha.reset();
      }

      if (!_branch.isActive)
        return; // don't add branch to render list if not active

      let mtxWorld: Matrix4x4 = _mtxWorld;
      _branch.nNodesInBranch = 1;
      _branch.radius = 0;

      if (_branch.cmpTransform && _branch.cmpTransform.isActive)
        mtxWorld = Matrix4x4.MULTIPLICATION(_mtxWorld, _branch.cmpTransform.mtxLocal);

      _branch.mtxWorld.set(mtxWorld); // overwrite readonly mtxWorld of the current node
      _branch.timestampUpdate = Render.timestampUpdate;

      let cmpLights: ComponentLight[] = _branch.getComponents(ComponentLight);
      for (let cmpLight of cmpLights) {
        if (!cmpLight.isActive)
          continue;
        let type: TypeOfLight = cmpLight.light.getType();
        let lightsOfType: ComponentLight[] = _lights.get(type);
        if (!lightsOfType) {
          lightsOfType = [];
          _lights.set(type, lightsOfType);
        }
        lightsOfType.push(cmpLight);
      }

      let cmpMesh: ComponentMesh = _branch.getComponent(ComponentMesh);
      let cmpMaterial: ComponentMaterial = _branch.getComponent(ComponentMaterial);
      if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
        // TODO: careful when using particlesystem, pivot must not change node position
        cmpMesh.mtxWorld = Matrix4x4.MULTIPLICATION(_branch.mtxWorld, cmpMesh.mtxPivot);
        let shader: typeof Shader = cmpMaterial.material.getShader();
        if (_shadersUsed.indexOf(shader) < 0)
          _shadersUsed.push(shader);

        _branch.radius = cmpMesh.radius;
        if (cmpMaterial.sortForAlpha)
          Render.nodesAlpha.push(_branch); // add this node to render list
        else
          Render.nodesSimple.push(_branch); // add this node to render list
      }

      for (let child of _branch.getChildren()) {
        Render.prepare(child, mtxWorld, _lights, _shadersUsed);

        _branch.nNodesInBranch += child.nNodesInBranch;
        let cmpMeshChild: ComponentMesh = child.getComponent(ComponentMesh);
        let position: Vector3 = cmpMeshChild ? cmpMeshChild.mtxWorld.translation : child.mtxWorld.translation;

        _branch.radius = Math.max(_branch.radius, Vector3.DIFFERENCE(position, _branch.mtxWorld.translation).magnitude + child.radius);
      }

      if (firstLevel)
        for (let shader of _shadersUsed)
          Render.setLightsInShader(shader, _lights);


      //Calculate Physics based on all previous calculations    
      Render.setupPhysicalTransform(_branch);
    }
    //#endregion

    //#region Picking
    /**
     * Used with a [[Picker]]-camera, this method renders one pixel with picking information 
     * for each node in the line of sight and return that as an unsorted [[Pick]]-array
     */
    public static pickBranch(_branch: Node, _cmpCamera: ComponentCamera): Pick[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      Render.ƒpicked = [];
      let size: number = Math.ceil(Math.sqrt(_branch.nNodesInBranch));
      Render.createPickTexture(size);
      Render.setBlendMode(BLEND.OPAQUE);

      for (let node of _branch.getIterator(true)) {
        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let cmpMaterial: ComponentMaterial = node.getComponent(ComponentMaterial);
        if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
          let mtxMeshToView: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
          Render.pick(node, node.mtxWorld, mtxMeshToView);
          // RenderParticles.drawParticles();
          Recycler.store(mtxMeshToView);
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
      // TODO: Move physics rendering to RenderPhysics extension of RenderManager
      if (Physics.world && Physics.world.mainCam != _cmpCamera)
        Physics.world.mainCam = _cmpCamera; //DebugDraw needs to know the main camera beforehand, _cmpCamera is the viewport camera. | Marko Fehrenbach, HFU 2020

      // TODO: check physics
      if (Physics.settings != null && Physics.settings.debugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY) { //Give users the possibility to only show physics displayed | Marko Fehrenbach, HFU 2020
        Render.drawList(_cmpCamera, this.nodesSimple);
        Render.drawListAlpha(_cmpCamera);
      }

      if (Physics.settings && Physics.settings.debugDraw == true) {
        Physics.world.debugDraw.end();
      }
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
        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let mtxMeshToView: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
        let cmpMaterial: ComponentMaterial = node.getComponent(ComponentMaterial);
        Render.drawMesh(cmpMesh, cmpMaterial, node.mtxWorld, mtxMeshToView);
        Recycler.store(mtxMeshToView);
      }
    }

    //#region Physics
    /**
    * Physics Part -> Take all nodes with cmpRigidbody, and overwrite their local position/rotation with the one coming from 
    * the rb component, which is the new "local" WORLD position.
    */
    private static setupPhysicalTransform(_branch: Node): void {
      if (Physics.world != null && Physics.world.getBodyList().length >= 1) {
        let mutator: Mutator = {};
        for (let name in _branch.getChildren()) {
          let childNode: Node = _branch.getChildren()[name];
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