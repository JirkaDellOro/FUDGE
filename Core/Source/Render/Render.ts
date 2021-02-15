namespace FudgeCore {
  export type MapLightTypeToLightList = Map<TypeOfLight, ComponentLight[]>;

  /**
   * The main interface to the render engine, here WebGL (see superclass [[RenderWebGL]] and the RenderInjectors
   */
  export abstract class Render extends RenderWebGL {
    public static rectClip: Rectangle = new Rectangle(-1, 1, 2, -2);
    public static pickBuffer: Int32Array;
    private static timestampUpdate: number;

    //#region Picking
    /**
     * Used with a [[Picker]]-camera, this method renders one pixel with picking information 
     * for each node in the line of sight and return that as an unsorted [[Pick]]-array
     */
    public static drawBranchForPicking(_branch: Node, _cmpCamera: ComponentCamera): Pick[] { // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      Render.ƒpicked = [];
      let size: number = Math.ceil(Math.sqrt(_branch.nNodesInBranch));
      /* let texture: RenderTexture =  */
      Render.createPickTexture(size);

      // draw nodes
      Render.setBlendMode(BLEND.OPAQUE);
      Render.drawBranch(_branch, _cmpCamera, Render.pick);
      Render.setBlendMode(BLEND.TRANSPARENT);

      let picks: Pick[] = Render.getPicks(size, _cmpCamera);

      Render.resetFrameBuffer();
      return picks;
    }

    //#endregion

    //#region Transformation & Lights
    /**
     * Recursively iterates over the branch starting with the node given, recalculates all world transforms, 
     * collects all lights and feeds all shaders used in the graph with these lights
     */
    public static setupTransformAndLights(_branch: Node, _mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY(), _lights: MapLightTypeToLightList = new Map(), _shadersUsed: (typeof Shader)[] = null): number {
      Render.timestampUpdate = performance.now();
      let firstLevel: boolean = (_shadersUsed == null);
      if (firstLevel)
        _shadersUsed = [];

      let mtxWorld: Matrix4x4 = _mtxWorld;
      _branch.nNodesInBranch = 1;

      if (_branch.cmpTransform)
        mtxWorld = Matrix4x4.MULTIPLICATION(_mtxWorld, _branch.cmpTransform.local);

      _branch.mtxWorld.set(mtxWorld); // overwrite readonly mtxWorld of the current node
      _branch.timestampUpdate = Render.timestampUpdate;

      let cmpMesh: ComponentMesh = _branch.getComponent(ComponentMesh);
      if (cmpMesh)  // TODO: careful when using particlesystem, pivot must not change node position
        cmpMesh.mtxWorld = Matrix4x4.MULTIPLICATION(_branch.mtxWorld, cmpMesh.pivot);

      let cmpLights: ComponentLight[] = _branch.getComponents(ComponentLight);
      for (let cmpLight of cmpLights) {
        let type: TypeOfLight = cmpLight.light.getType();
        let lightsOfType: ComponentLight[] = _lights.get(type);
        if (!lightsOfType) {
          lightsOfType = [];
          _lights.set(type, lightsOfType);
        }
        lightsOfType.push(cmpLight);
      }

      let cmpMaterial: ComponentMaterial = _branch.getComponent(ComponentMaterial);
      if (cmpMaterial) {
        let shader: typeof Shader = cmpMaterial.material.getShader();
        if (_shadersUsed.indexOf(shader) < 0)
          _shadersUsed.push(shader);
      }

      for (let child of _branch.getChildren()) {
        _branch.nNodesInBranch += Render.setupTransformAndLights(child, mtxWorld, _lights, _shadersUsed);
      }

      if (firstLevel)
        for (let shader of _shadersUsed)
          Render.setLightsInShader(shader, _lights);

      return _branch.nNodesInBranch;
    }
    //#endregion

    //#region Drawing
    /**
     * The main rendering function to be called from [[Viewport]].
     * Draws the branch starting with the given [[Node]] using the camera given [[ComponentCamera]].
     */
    public static drawBranch(_branch: Node, _cmpCamera: ComponentCamera, _drawNode: Function = Render.drawNode): void {
      let mtxWorldToView: Matrix4x4 = _cmpCamera.mtxWorldToView;

      // TODO: Move physics rendering to RenderPhysics extension of RenderManager
      if (Physics.world && Physics.world.mainCam != _cmpCamera)
        Physics.world.mainCam = _cmpCamera; //DebugDraw needs to know the main camera beforehand, _cmpCamera is the viewport camera. | Marko Fehrenbach, HFU 2020
      Render.setupPhysicalTransform(_branch);

      //if (Physics.settings && Physics.settings.debugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY) //Give users the possibility to only show physics displayed | Marko Fehrenbach, HFU 2020
      Render.drawBranchRecursive(_branch, mtxWorldToView, _drawNode);

      if (Physics.settings && Physics.settings.debugDraw == true) {
        Physics.world.debugDraw.end();
      }
    }

    /**
     * Recursivly iterates over the graph and renders each node and all successors with the given render function
     */
    private static drawBranchRecursive(_branch: Node, _mtxWorldToView: Matrix4x4, _drawNode: Function = Render.drawNode): void {
      // TODO: see if third parameter _world?: Matrix4x4 would be usefull
      if (!_branch.isActive)
        return;

      let cmpMesh: ComponentMesh = _branch.getComponent(ComponentMesh);
      if (cmpMesh && cmpMesh.isActive) {
        let mtxMeshToView: Matrix4x4 = Matrix4x4.MULTIPLICATION(_mtxWorldToView, cmpMesh.mtxWorld);
        // TODO: create drawNode method for particle system using _node.mtxWorld instead of finalTransform
        _drawNode(_branch, _branch.mtxWorld, mtxMeshToView);
        // RenderParticles.drawParticles();
        Recycler.store(mtxMeshToView);
      }

      for (let childNode of _branch.getChildren())
        Render.drawBranchRecursive(childNode, _mtxWorldToView, _drawNode); //, world);
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