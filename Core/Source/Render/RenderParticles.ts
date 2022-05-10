namespace FudgeCore {
  /**
   * Class that is used inside of {@link Render} to draw the particle effects of nodes which have a {@link ComponentParticleSystem} attached.
   * @author Jonas Plotzky, HFU, 2020
   */
  export abstract class RenderParticles extends Render {

    /**
     * The render function for drawing a node which has a {@link ComponentParticleSystem} attached to it. The node represents a single particle of the particle system. Based on the attached ComponentParticleSystem the whole particle system will be drawn in its determined state.
     */
    public static drawParticles(_node: Node, _nodeTransform: Matrix4x4, _cmpParticleSystem: ComponentParticleSystem, _cmpMesh: ComponentMesh, _cmpMaterial: ComponentMaterial, _cmpCamera: ComponentCamera): void {
      let mesh: Mesh = _cmpMesh.mesh;
      let shader: typeof Shader = _cmpMaterial.material.getShader();
      let coat: Coat = _cmpMaterial.material.coat;
      shader.useProgram();

      //TODO: getting translationCamera is similiar to what happens in _cmpCamera.ViewProjectionMatrix. Further clean up is needed
      // TODO: use extra component for billboard effect
      // let translationCamera: Vector3 = _cmpCamera.mtxPivot.translation;
      // try {
      //   translationCamera = Matrix4x4.MULTIPLICATION(_cmpCamera.node.mtxWorld, _cmpCamera.mtxPivot).translation;
      // } catch (_error) {
      //   // no container node or no world transformation found -> continue with pivot only
      // }
      let mtxWorldToView: Matrix4x4 = _cmpCamera.mtxWorldToView;

      let effect: ParticleEffect = _cmpParticleSystem.particleEffect;
      let variables: ParticleVariables = _cmpParticleSystem.variables;
      variables[PARTICLE_VARIBALE_NAMES.TIME] = Time.game.get() / 1000;
      // TODO: unify transform and other components
      let structureTransformLocal: ParticleEffectStructure = effect.transformLocal;
      let structureTransformWorld: ParticleEffectStructure = effect.transformWorld;
      let structureComponentMutations: ParticleEffectStructure = effect.componentMutations;
      let cachedMutators: {[key: string]: Mutator} = effect.cachedMutators;

      // get relevant components
      let components: Component[] = [];
      for (const componentClass in structureComponentMutations) {
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

      let storageParticle: ParticleEffectStructure = effect.storageParticle;

      for (let i: number = 0, length: number = <number>variables[PARTICLE_VARIBALE_NAMES.SIZE]; i < length; i++) {
        variables[PARTICLE_VARIBALE_NAMES.INDEX] = i;

        // evaluate particle storage
        _cmpParticleSystem.evaluateStorage(storageParticle);

        // apply transformations
        let mtxFinal: Matrix4x4 = Matrix4x4.IDENTITY();
        mtxFinal.multiply(_nodeTransform);
        this.applyTransform(mtxFinal, structureTransformLocal, cachedMutators, variables);
        // if (_cmpMesh.showToCamera)
          // mtxFinal.showTo(translationCamera); // TODO: use extra component for billboard effect
        mtxFinal.multiply(_cmpMesh.mtxPivot);
        if (structureTransformWorld) {
          let transformWorld: Matrix4x4 = Matrix4x4.IDENTITY();
          this.applyTransform(transformWorld, structureTransformWorld, cachedMutators, variables);
          mtxFinal.multiply(transformWorld, true);
          Recycler.store(transformWorld);
        }

        // mutate components
        for (const component of components) {
          component.mutate(this.evaluateMutatorWith(cachedMutators[component.type], <ParticleEffectStructure>structureComponentMutations[component.type], variables));
        }

        // render
        let mtxProjection: Matrix4x4 = Matrix4x4.MULTIPLICATION(mtxWorldToView, mtxFinal);
        let renderBuffers: RenderBuffers =  mesh.useRenderBuffers(shader, mtxFinal, mtxProjection);
        coat.useRenderData(shader, _cmpMaterial);
        this.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        Recycler.store(mtxProjection);
        Recycler.store(mtxFinal);
      }

      // restore saved component state
      for (let i: number = 0; i < componentsLength; i++) {
        components[i].mutate(componentMutators[i]);
      }
    }

    private static applyTransform(_transform: Matrix4x4, _structureTransform: ParticleEffectStructure, _mutatorCache: {[key: string]: Mutator}, _variables: ParticleVariables): void {
      for (const key in _structureTransform) {
        let transformVector: Vector3 = key == "scale" ? Vector3.ONE() : Vector3.ZERO();
        transformVector.mutate(this.evaluateMutatorWith(_mutatorCache[key], <ParticleEffectStructure>_structureTransform[key], _variables));
        (<General>_transform)[key](transformVector);
        Recycler.store(transformVector);
      }
    }

    private static evaluateMutatorWith(_mutator: Mutator, _effectStructure: ParticleEffectStructure, _variables: ParticleVariables): Mutator {
      for (const attribute in _effectStructure) {
        let effectStructureOrFunction: ParticleEffectStructure | Function = _effectStructure[attribute];
        if (effectStructureOrFunction instanceof Function) {
          _mutator[attribute] = (<ParticleClosure>effectStructureOrFunction)(_variables);
        } else {
          this.evaluateMutatorWith(<Mutator>_mutator[attribute], effectStructureOrFunction, _variables);
        }
      }
      return _mutator;
    }
  }
}