namespace FudgeCore {
  export abstract class RenderParticles extends RenderManager {
    public static drawParticles(_node: Node, _nodeTransform: Matrix4x4, _cmpCamera: ComponentCamera): void {
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      let mesh: Mesh = cmpMesh.mesh;

      let shader: typeof Shader = cmpMaterial.material.getShader();
      let coat: Coat = cmpMaterial.material.getCoat();
      shader.useProgram();

      let particleEffect: ParticleEffect = cmpParticleSystem.particleEffect;

      let storedValues: StoredValues = particleEffect.storedValues;

      storedValues["time"] = Time.game.get() / 1000;

      // TODO: names
      let transformLocal: ParticleEffectData = particleEffect.transformLocal;
      let transformWorld: ParticleEffectData = particleEffect.transformWorld;
      let mutationComponents: ParticleEffectData = particleEffect.mutationComponents;

      // get relevant components
      let components: Component[] = [];
      for (const componentClass in mutationComponents) {
        components.push(_node.getComponent((<General>globalThis["FudgeCore"])[componentClass]));
      }
      let componentsLength: number = components.length;
      // save their state
      let componentMutators: Mutator[] = [];
      for (let i: number = 0; i < componentsLength; i++) {
        componentMutators.push(components[i].getMutator());
      }

      // evaluate update storage
      cmpParticleSystem.evaluateClosureStorage(particleEffect.storageUpdate);

      let storageParticle: ParticleEffectData;
      storageParticle = particleEffect.storageParticle;

      let cameraViewProjectionMatrix: Matrix4x4 = _cmpCamera.ViewProjectionMatrix;

      for (let i: number = 0, length: number = storedValues["size"]; i < length; i++) {
        storedValues["index"] = i;

        // evaluate particle storage
        cmpParticleSystem.evaluateClosureStorage(storageParticle);

        // apply transformations
        let finalTransform: Matrix4x4 = Matrix4x4.IDENTITY();

        finalTransform.mutate(this.getMutatorFor(transformLocal));
        for (const key in transformLocal) {
          // TODO: change this somehow... get mutators out of vectors and change them + get correct vector
          let transformVector: Vector3 = key == "scale" ? Vector3.ONE() : Vector3.ZERO();
          transformVector.mutate(this.getMutatorFor(transformLocal[key]));
          (<General>finalTransform)[key](transformVector);
          Recycler.store(transformVector);
        }

        let worldTransform: Matrix4x4 = Matrix4x4.IDENTITY(); // only if world is set in json
        for (const key in transformWorld) {
          let transformVector: Vector3 = Vector3.ZERO();
          transformVector.mutate(this.getMutatorFor(transformWorld[key]));
          (<General>worldTransform)[key](transformVector);
          Recycler.store(transformVector);
        }

        // apply system transformation
        finalTransform.multiply(cmpMesh.pivot);
        finalTransform.multiply(_nodeTransform, true);
        finalTransform.multiply(worldTransform, true);

        // TODO: optimize check component mesh
        // transformation.showTo(Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.pivot).translation);

        // evaluate component data
        for (let i: number = 0; i < componentsLength; i++) {
          components[i].mutate(this.getMutatorFor(mutationComponents[components[i].type]));
        }

        // render
        let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(cameraViewProjectionMatrix, finalTransform);

        mesh.useRenderBuffers(shader, finalTransform, projection);
        coat.useRenderData(shader, cmpMaterial);
        RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        Recycler.store(projection);
        Recycler.store(worldTransform);
        Recycler.store(finalTransform);
      }

      // restore component state
      for (let i: number = 0; i < componentsLength; i++) {
        components[i].mutate(componentMutators[i]);
      }
    }

    // TODO: don't create new Mutators all the time
    private static getMutatorFor(_effectData: ParticleEffectData): Mutator {
      let mutator: Mutator = {};
      for (const attribute in _effectData) {
        let value: Object = _effectData[attribute];
        if (typeof value === "function") {
          mutator[attribute] = (<Function>value)();
        } else {
          mutator[attribute] = this.getMutatorFor(value);
        }
      }
      return mutator;
    }

    private static evaluateMutator(_effectData: ParticleEffectData, _mutator: Mutator): void {
      for (const attribute in _effectData) {
        let value: Object = _effectData[attribute];
        if (typeof value === "function") {
          _mutator[attribute] = (<Function>value)();
        } else {
          this.evaluateMutator(value, <Mutator>_mutator[attribute]);
        }
      }
    }
  }
}