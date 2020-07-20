namespace FudgeCore {
  /**
   * Class that is used inside of [[RenderManager]] to draw the particle effects of nodes which have a [[ComponentParticleSystem]] attached.
   * @author Jonas Plotzky, HFU, 2020
   */
  export abstract class RenderParticles extends RenderManager {

    /**
     * The render function for drawing a node which has a [[ComponentParticleSystem]] attached to it. The node represents a single particle of the particle system. Based on the attached [[ComponentParticleSystem]] the whole particle system will be drawn in its determined state.
     */
    public static drawParticles(_node: Node, _nodeTransform: Matrix4x4, _cmpParticleSystem: ComponentParticleSystem, _cmpMesh: ComponentMesh, _cmpCamera: ComponentCamera): void {
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let mesh: Mesh = _cmpMesh.mesh;
      let shader: typeof Shader = cmpMaterial.material.getShader();
      let coat: Coat = cmpMaterial.material.getCoat();
      shader.useProgram();

      let translationCamera: Vector3 = _cmpCamera.pivot.translation;
      try {
        translationCamera = Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.pivot).translation;
      } catch (_error) {
        // no container node or no world transformation found -> continue with pivot only
      }
      let cameraViewProjectionMatrix: Matrix4x4 = _cmpCamera.ViewProjectionMatrix;

      let particleEffect: ParticleEffect = _cmpParticleSystem.particleEffect;
      let storedValues: StoredValues = particleEffect.storedValues;
      storedValues["time"] = Time.game.get() / 1000;
      particleEffect.randomNumbers = _cmpParticleSystem.randomNumbers;
      let dataTransformLocal: ParticleEffectData = particleEffect.transformLocal;
      let dataTransformWorld: ParticleEffectData = particleEffect.transformWorld;
      let dataComponentMutations: ParticleEffectData = particleEffect.componentMutations;
      let cachedMutators: Map<ParticleEffectData, Mutator> = particleEffect.cachedMutators;

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
      _cmpParticleSystem.evaluateClosureStorage(particleEffect.storageUpdate);

      let storageParticle: ParticleEffectData;
      storageParticle = particleEffect.storageParticle;

      for (let i: number = 0, length: number = storedValues["size"]; i < length; i++) {
        storedValues["index"] = i;

        // evaluate particle storage
        _cmpParticleSystem.evaluateClosureStorage(storageParticle);

        // apply transformations
        let finalTransform: Matrix4x4 = Matrix4x4.IDENTITY();
        finalTransform.multiply(_nodeTransform);
        this.applyTransform(finalTransform, dataTransformLocal, cachedMutators);
        if (_cmpMesh.showToCamera)
          finalTransform.showTo(translationCamera);
        finalTransform.multiply(_cmpMesh.pivot);
        if (dataTransformWorld) {
          let transformWorld: Matrix4x4 = Matrix4x4.IDENTITY();
          this.applyTransform(transformWorld, dataTransformWorld, cachedMutators);
          finalTransform.multiply(transformWorld, true);
          Recycler.store(transformWorld);
        }

        // mutate components
        for (let i: number = 0; i < componentsLength; i++) {
          components[i].mutate(this.getMutatorFrom(dataComponentMutations[components[i].type], cachedMutators));
        }

        // render
        let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(cameraViewProjectionMatrix, finalTransform);
        mesh.useRenderBuffers(shader, finalTransform, projection);
        coat.useRenderData(shader, cmpMaterial);
        RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        Recycler.store(projection);
        Recycler.store(finalTransform);
      }

      // restore saved component state
      for (let i: number = 0; i < componentsLength; i++) {
        components[i].mutate(componentMutators[i]);
      }
    }

    private static applyTransform(_transform: Matrix4x4, _dataTransform: ParticleEffectData, _mutatorMap: Map<ParticleEffectData, Mutator>): void {
      for (const key in _dataTransform) {
        let transformVector: Vector3 = key == "scale" ? Vector3.ONE() : Vector3.ZERO();
        transformVector.mutate(this.getMutatorFrom(_dataTransform[key], _mutatorMap));
        (<General>_transform)[key](transformVector);
        Recycler.store(transformVector);
      }
    }

    private static getMutatorFrom(_effectData: ParticleEffectData, _mutatorMap: Map<ParticleEffectData, Mutator>): Mutator {
      return this.evaluateMutatorWith(_mutatorMap.get(_effectData), _effectData);
    }

    private static evaluateMutatorWith(_mutator: Mutator, _effectData: ParticleEffectData): Mutator {
      for (const attribute in _effectData) {
        let value: Object = _effectData[attribute];
        if (typeof value === "function") {
          _mutator[attribute] = (<Function>value)();
        } else {
          this.evaluateMutatorWith(<Mutator>_mutator[attribute], value);
        }
      }
      return _mutator;
    }
  }
}