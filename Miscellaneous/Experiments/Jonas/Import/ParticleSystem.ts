namespace Import {
  export interface StoredValues {
    [key: string]: number;
  }

  export class ParticleSystem extends f.Node {
    private particles: f.Node[];
    private randomNumbers: number[] = [];
    private storedValues: StoredValues = {};
    private effectDefinition: ParticleEffectDefinition;

    constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number) {
      super("Particles");
      this.addComponent(new f.ComponentTransform());
      this.cmpTransform.local = _transform;

      for (let i: number = 0; i < _numberOfParticles; i++) {
        this.addChild(this.createParticle(_mesh, _material));
      }
      this.particles = this.getChildrenByName("Particle");

      for (let i: number = 0; i < 1000; i++) {
        this.randomNumbers.push(Math.random());
      }

      this.storedValues = {
        "time": 0,
        "index": 0,
        "size": _numberOfParticles
      };

      let effectImporter: ParticleEffectImporter = new ParticleEffectImporter(this.storedValues, this.randomNumbers);
      this.effectDefinition = effectImporter.parseFile(data);

      // evaluate system storage
      this.evaluateClosureStorage(this.effectDefinition.system);
    }

    public update(_time: number): void {
      this.storedValues["time"] = _time;

      // evaluate update storage
      this.evaluateClosureStorage(this.effectDefinition.update);

      for (let index: number = 0, length: number = this.particles.length; index < length; ++index) {
        this.storedValues["index"] = index;

        // evaluate particle storage
        this.evaluateClosureStorage(this.effectDefinition.particle);

        let transformation: f.Matrix4x4 = f.Matrix4x4.IDENTITY();

        // calculate local translation
        transformation.translate(this.evaluateClosureVector(this.effectDefinition.translation));

        // calculate rotation
        transformation.rotate(this.evaluateClosureVector(this.effectDefinition.rotation), true);

        // calculate world translation
        transformation.translate(this.evaluateClosureVector(this.effectDefinition.translationWorld), false);

        // f.Debug.log("trans", transformation.toString());
        this.particles[index].mtxLocal.set(transformation);

        // calculate scaling
        this.particles[index].getComponent(f.ComponentMesh).pivot.scaling = this.evaluateClosureVector(this.effectDefinition.scaling);

        //calculate color
        this.particles[index].getComponent(f.ComponentMaterial).clrPrimary = new f.Color(this.effectDefinition.color.r(), this.effectDefinition.color.g(), this.effectDefinition.color.b(), this.effectDefinition.color.a());
      }
    }

    private evaluateClosureStorage(_closureStorage: ClosureStorage): void {
      for (const key in _closureStorage) {
        this.storedValues[key] = _closureStorage[key]();
      }
    }

    private evaluateClosureVector(_closureVector: ClosureVector): f.Vector3 {
      return new f.Vector3(
        _closureVector.x(), _closureVector.y(), _closureVector.z());
    }

    private createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
      let node: f.Node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
      return node;
    }
  }
}