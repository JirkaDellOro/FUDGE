namespace FudgeCore {
  export abstract class RenderParticles extends RenderManager {
    public static drawParticles(_node: Node, _systemTransform: Matrix4x4, _cmpCamera: ComponentCamera): void {
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let mesh: Mesh = _node.getComponent(ComponentMesh).mesh;
      let materialMutator: Mutator = cmpMaterial.getMutator();

      // let saved: Mutator[] = [];
      // let components: Component[] = _node.getAllComponents();
      // let componentsLength: number = components.length;
      // for (let i: number = 0; i < componentsLength; i++) {
      //   saved.push(components[i].getMutator());
      // }

      let storedValues: StoredValues = cmpParticleSystem.storedValues;
      let effectDefinition: ParticleEffectDefinition = cmpParticleSystem.effectDefinition;


      // evaluate update storage
      cmpParticleSystem.evaluateClosureStorage(effectDefinition.update);

      // TODO: ask if creating particle node is necessary
      // let particle: Node = new Node("Particle");

      for (let i: number = 0, length: number = storedValues["size"]; i < length; i++) {
        storedValues["index"] = i;

        // evaluate index storage
        cmpParticleSystem.evaluateClosureStorage(effectDefinition.particle);

        let finalTransform: Matrix4x4 = Matrix4x4.IDENTITY();

        // calculate local translation
        finalTransform.translate(cmpParticleSystem.evaluateClosureVector(effectDefinition.translation));
        // transformation.translation = cmpParticleSystem.evaluateClosureVector(effectDefinition.translation);

        // calculate rotation
        finalTransform.rotate(cmpParticleSystem.evaluateClosureVector(effectDefinition.rotation), true);
        // transformation.rotation = cmpParticleSystem.evaluateClosureVector(effectDefinition.rotation);

        // calculate world translation
        finalTransform.translate(cmpParticleSystem.evaluateClosureVector(effectDefinition.translationWorld), false);

        // apply system transformation
        finalTransform.multiply(_systemTransform, true);

        // TODO: optimize
        // transformation.showTo(Matrix4x4.MULTIPLICATION(_cmpCamera.getContainer().mtxWorld, _cmpCamera.pivot).translation);

        // calculate scaling
        finalTransform.scale(cmpParticleSystem.evaluateClosureVector(effectDefinition.scaling));
        // transformation.scaling = cmpParticleSystem.evaluateClosureVector(effectDefinition.scaling);

        //calculate color
        cmpMaterial.clrPrimary.r = effectDefinition.color.r();
        cmpMaterial.clrPrimary.g = effectDefinition.color.g();
        cmpMaterial.clrPrimary.b = effectDefinition.color.b();
        cmpMaterial.clrPrimary.a = effectDefinition.color.a();

        let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);

        RenderManager.draw(mesh, cmpMaterial, finalTransform, projection);
        // this increases fps
        Recycler.store(projection);
        Recycler.store(finalTransform);
      }

      // restore
      // for (let i: number = 0; i < componentsLength; i++) {
      //   components[i].mutate(saved[i]);
      // }
      cmpMaterial.mutate(materialMutator);
    }
  }
}