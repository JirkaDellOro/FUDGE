namespace FudgeCore {
  export abstract class RenderParticles extends RenderManager {
    public static drawParticles(_node: Node, _systemTransform: Matrix4x4, _cmpCamera: ComponentCamera): void {
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      let mesh: Mesh = cmpMesh.mesh;

      let shader: typeof Shader = cmpMaterial.material.getShader();
      let coat: Coat = cmpMaterial.material.getCoat();
      shader.useProgram();

      let storedValues: StoredValues = cmpParticleSystem.storedValues;
      let effectData: ParticleEffectData = cmpParticleSystem.effectData;

      let storageData: ParticleEffectData = effectData["storage"];
      let transformData: ParticleEffectData = effectData["transformations"];
      let transformDataLocal: ParticleEffectData = transformData["local"];
      let transformDataWorld: ParticleEffectData = transformData["world"];
      let componentsData: ParticleEffectData = effectData["components"];

      // get relevant components
      let components: Component[] = [];
      for (const componentClass in componentsData) {
        components.push(_node.getComponent((<General>globalThis["FudgeCore"])[componentClass]));
      }
      let componentsLength: number = components.length;
      // save their state
      let componentMutators: Mutator[] = [];
      for (let i: number = 0; i < componentsLength; i++) {
        componentMutators.push(components[i].getMutator());
      }

      let particleStorage: ParticleEffectData;
      // evaluate update storage
      if (storageData) {
        cmpParticleSystem.evaluateClosureStorage(storageData["update"]);
        particleStorage = storageData["particle"];
      }

      let cameraViewProjectionMatrix: Matrix4x4 = _cmpCamera.ViewProjectionMatrix;
      // let meshPivotScaling: Vector3 = cmpMesh.pivot.scaling;

      for (let i: number = 0, length: number = storedValues["size"]; i < length; i++) {
        storedValues["index"] = i;

        // evaluate particle storage
        cmpParticleSystem.evaluateClosureStorage(particleStorage);

        // apply transformations
        let finalTransform: Matrix4x4 = Matrix4x4.IDENTITY();

        // for (const key in transformDataLocal) {
        //   // TODO: change this somehow... get mutators out of vectors and change them + get correct vector
        //   let transformMatrix: Matrix4x4 = Matrix4x4.IDENTITY();
        //   let mutator: Mutator = {};
        //   mutator[key] = this.getMutatorFor(transformDataLocal[key]);
        //   transformMatrix.mutate(mutator);
        //   finalTransform.multiply(transformMatrix);
        //   Recycler.store(transformMatrix);
        // }

        finalTransform.mutate(this.getMutatorFor(transformDataLocal));
        for (const key in transformDataLocal) {
          // TODO: change this somehow... get mutators out of vectors and change them + get correct vector
          let transformVector: Vector3 = key == "scale" ? _systemTransform.scaling : Vector3.ZERO();
          transformVector.mutate(this.getMutatorFor(transformDataLocal[key]));
          (<General>finalTransform)[key](transformVector);
          Recycler.store(transformVector);
        }

        let worldTransform: Matrix4x4 = Matrix4x4.IDENTITY();
        for (const key in transformDataWorld) {
          let transformVector: Vector3 = Vector3.ZERO();
          transformVector.mutate(this.getMutatorFor(transformDataWorld[key]));
          (<General>worldTransform)[key](transformVector);
          Recycler.store(transformVector);
        }

        // apply system transformation
        // finalTransform.scale(meshPivotScaling); // this is slower than matrix multiplication
        finalTransform.multiply(cmpMesh.pivot);
        finalTransform.multiply(_systemTransform, true);
        finalTransform.multiply(worldTransform, true);

        // TODO: optimize
        // transformation.showTo(Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.pivot).translation);

        // evaluate component data
        for (let i: number = 0; i < componentsLength; i++) {
          components[i].mutate(this.getMutatorFor(componentsData[components[i].type]));
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