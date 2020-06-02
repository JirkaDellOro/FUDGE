namespace FudgeCore {
  export abstract class RenderParticles extends RenderManager {
    public static drawParticles(_node: Node, _systemTransform: Matrix4x4, _cmpCamera: ComponentCamera, _drawNode: Function = RenderManager.drawNode): void {
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let saved: Mutator[] = [];
      let components: Component[] = _node.getAllComponents();
      let componentsLength: number = components.length;
      for (let i: number = 0; i < componentsLength; i++) {
        saved.push(components[i].getMutator());
      }
      let storedValues: StoredValues = cmpParticleSystem.storedValues;
      let effectDefinition: ParticleEffectDefinition = cmpParticleSystem.effectDefinition;

      // evaluate update storage
      cmpParticleSystem.evaluateClosureStorage(effectDefinition.update);

      for (let i: number = 0, length: number = storedValues["size"]; i < length; i++) {
        storedValues["index"] = i;

        // evaluate index storage
        cmpParticleSystem.evaluateClosureStorage(effectDefinition.particle);

        let transformation: Matrix4x4 = Matrix4x4.IDENTITY();
        // calculate local translation
        transformation.translate(cmpParticleSystem.evaluateClosureVector(effectDefinition.translation));

        // calculate rotation
        transformation.rotate(cmpParticleSystem.evaluateClosureVector(effectDefinition.rotation), true);

        // calculate world translation
        transformation.translate(cmpParticleSystem.evaluateClosureVector(effectDefinition.translationWorld), false);

        transformation.multiply(_systemTransform, true);

        let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, transformation);
        _drawNode(_node, transformation, projection);
      }

      // console.log(RenderParticles.crc3);
      // restore
      for (let i: number = 0; i < componentsLength; i++) {
        components[i].mutate(saved[i]);
      }
    }
  }
}