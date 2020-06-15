namespace FudgeCore {
  export abstract class RenderParticles extends RenderManager {
    public static drawParticles(_node: Node, _systemTransform: Matrix4x4, _cmpCamera: ComponentCamera): void {
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;

      let shader: typeof Shader = cmpMaterial.material.getShader();
      let coat: Coat = cmpMaterial.material.getCoat();
      shader.useProgram();

      let components: Component[] = _node.getAllComponents();
      // TODO: only get components that will be manipulated?
      let componentsLength: number = components.length;
      let componentMutators: Mutator[] = [];
      for (let i: number = 0; i < componentsLength; i++) {
        componentMutators.push(components[i].getMutator());
      }

      let storedValues: StoredValues = cmpParticleSystem.storedValues;
      let effectData: ParticleEffectData = cmpParticleSystem.effectData;

      let storageData: ParticleEffectData = <ParticleEffectData>effectData["storage"];
      let transformData: ParticleEffectData[] = <ParticleEffectData[]>effectData["transformations"];
      let componentsData: ParticleEffectData = <ParticleEffectData>effectData["components"];

      // evaluate update storage
      cmpParticleSystem.evaluateClosureStorage(<ParticleEffectData>storageData["update"]);
      // console.log(effectData);

      let particleStorage: ParticleEffectData = <ParticleEffectData>storageData["particle"];
      for (let i: number = 0, length: number = storedValues["size"]; i < length; i++) {
        storedValues["index"] = i;

        // evaluate index storage
        cmpParticleSystem.evaluateClosureStorage(particleStorage);

        let finalTransform: Matrix4x4 = Matrix4x4.IDENTITY();

        for (const data of transformData) {
          for (const key in data) {
            let transformVector: Vector3 = Vector3.ZERO();
            transformVector.mutate(this.getMutatorFor(<Mutator>data[key]));
            (<any>finalTransform)[key](transformVector);
            Recycler.store(transformVector);
          }  
        }

        // apply system transformation
        finalTransform.multiply(_systemTransform, true);

        // TODO: optimize
        // transformation.showTo(Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.pivot).translation);

        // evaluate component data
        for (let i: number = 0; i < componentsLength; i++) {
          components[i].mutate(this.getMutatorFor(<ParticleEffectData>componentsData[components[i].type]));
        }

        let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);

        mesh.useRenderBuffers(shader, finalTransform, projection);
        coat.useRenderData(shader, cmpMaterial);
        RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        Recycler.store(projection);
        Recycler.store(finalTransform);
      }

      // restore
      for (let i: number = 0; i < componentsLength; i++) {
        components[i].mutate(componentMutators[i]);
      }
    }

    // TODO: don't create new Mutators all the time
    private static getMutatorFor(_effectData: ParticleEffectData): Mutator {
      let mutator: Mutator = {};
      for (const attribute in _effectData) {
        let value: Object = <ParticleEffectData>_effectData[attribute];
        if (typeof value === "function") {
          mutator[attribute] = (<Function>value)();
        } else {
          mutator[attribute] = this.getMutatorFor(<ParticleEffectData>value);
        }
      }
      return mutator;
    }

    private static evaluateMutator(_effectData: ParticleEffectData, _mutator: Mutator): void {
      for (const attribute in _effectData) {
        let value: Object = <ParticleEffectData>_effectData[attribute];
        if (typeof value === "function") {
          _mutator[attribute] = (<Function>value)();
        } else {
          this.evaluateMutator(<ParticleEffectData>value, <Mutator>_mutator[attribute]);
        }
      }
    }
  }
}