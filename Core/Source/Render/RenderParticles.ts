namespace FudgeCore {
  /**
   * Class that is used inside of [[RenderManager]] to draw the particle effects of nodes which have a [[ComponentParticleSystem]] attached.
   * @author Jonas Plotzky, HFU, 2020
   */
  export abstract class RenderParticles extends Render {

    /**
     * The render function for drawing a node which has a [[ComponentParticleSystem]] attached to it. The node represents a single particle of the particle system. Based on the attached [[ComponentParticleSystem]] the whole particle system will be drawn in its determined state.
     */
    public static drawParticles(_node: Node, _nodeTransform: Matrix4x4, _cmpParticleSystem: ComponentParticleSystem, _cmpMesh: ComponentMesh, _cmpCamera: ComponentCamera): void {
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let mesh: Mesh = _cmpMesh.mesh;
      let shader: typeof Shader = cmpMaterial.material.getShader();
      let coat: Coat = cmpMaterial.material.coat;
      shader.useProgram();

      //TODO: getting translationCamera is similiar to what happens in _cmpCamera.ViewProjectionMatrix. Further clean up is needed
      let translationCamera: Vector3 = _cmpCamera.mtxPivot.translation;
      try {
        translationCamera = Matrix4x4.MULTIPLICATION(_cmpCamera.node.mtxWorld, _cmpCamera.mtxPivot).translation;
      } catch (_error) {
        // no container node or no world transformation found -> continue with pivot only
      }
      let cameraViewProjectionMatrix: Matrix4x4 = _cmpCamera.mtxWorldToView;

      let effect: ParticleEffect = _cmpParticleSystem.particleEffect;
      let variables: ParticleVariables = _cmpParticleSystem.variables;
      variables[PARTICLE_VARIBALE_NAMES.TIME] = Time.game.get() / 1000;
      let dataTransformLocal: ParticleEffectData = effect.transformLocal;
      let dataTransformWorld: ParticleEffectData = effect.transformWorld;
      let dataComponentMutations: ParticleEffectData = effect.componentMutations;
      let cachedMutators: {[key: string]: Mutator} = effect.cachedMutators;

      // get relevant components
      let components: Component[] = [];
      for (const componentClass in dataComponentMutations) {
        components.push(_node.getComponent((<General>globalThis["FudgeCore"])[componentClass]));
      }
      let componentsLength: number = components.length;
      // save their state
      let componentMutators: Mutator[] = [];
      for (let i: number = 0; i < componentsLength; i++) {
        componentMutators.push(components[i].getMutator());
      }

      // evaluate update storage
      _cmpParticleSystem.evaluateStorage(effect.storageUpdate);

      let storageParticle: ParticleEffectData = effect.storageParticle;

      for (let i: number = 0, length: number = <number>variables[PARTICLE_VARIBALE_NAMES.SIZE]; i < length; i++) {
        variables[PARTICLE_VARIBALE_NAMES.INDEX] = i;

        // evaluate particle storage
        _cmpParticleSystem.evaluateStorage(storageParticle);

        // apply transformations
        let finalTransform: Matrix4x4 = Matrix4x4.IDENTITY();
        finalTransform.multiply(_nodeTransform);
        this.applyTransform(finalTransform, dataTransformLocal, cachedMutators, variables);
        if (_cmpMesh.showToCamera)
          finalTransform.showTo(translationCamera);
        finalTransform.multiply(_cmpMesh.mtxPivot);
        if (dataTransformWorld) {
          let transformWorld: Matrix4x4 = Matrix4x4.IDENTITY();
          this.applyTransform(transformWorld, dataTransformWorld, cachedMutators, variables);
          finalTransform.multiply(transformWorld, true);
          Recycler.store(transformWorld);
        }

        // mutate components
        for (const component of components) {
          component.mutate(this.evaluateMutatorWith(cachedMutators[component.type], dataComponentMutations[component.type], variables));
        }

        // render
        let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(cameraViewProjectionMatrix, finalTransform);
        let renderBuffers: RenderBuffers =  mesh.useRenderBuffers(shader, finalTransform, projection);
        coat.useRenderData(shader, cmpMaterial);
        this.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        Recycler.store(projection);
        Recycler.store(finalTransform);
      }

      // restore saved component state
      for (let i: number = 0; i < componentsLength; i++) {
        components[i].mutate(componentMutators[i]);
      }
    }

    private static applyTransform(_transform: Matrix4x4, _dataTransform: ParticleEffectData, _mutatorCache: {[key: string]: Mutator}, _variables: ParticleVariables): void {
      for (const key in _dataTransform) {
        let transformVector: Vector3 = key == "scale" ? Vector3.ONE() : Vector3.ZERO();
        transformVector.mutate(this.evaluateMutatorWith(_mutatorCache[key], _dataTransform[key], _variables));
        (<General>_transform)[key](transformVector);
        Recycler.store(transformVector);
      }
    }

    private static evaluateMutatorWith(_mutator: Mutator, _effectData: ParticleEffectData, _variables: ParticleVariables): Mutator {
      for (const attribute in _effectData) {
        let value: Object = _effectData[attribute];
        if (typeof value === "function") {
          _mutator[attribute] = (<ParticleClosure>value)(_variables);
        } else {
          this.evaluateMutatorWith(<Mutator>_mutator[attribute], value, _variables);
        }
      }
      return _mutator;
    }
  }
}