///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>

namespace Import {
  import f = FudgeCore;
  import fAid = FudgeAid;

  // export interface StoredValues {
  //   [key: string]: number;
  // }

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
    }

    public update(_time: number): void {
      this.storedValues["time"] = _time;

      // evaluate storage
      for (const key in this.effectDefinition.storage) {
        console.groupCollapsed(`Evaluate storage "${key}"`);
        this.storedValues[key] = this.effectDefinition.storage[key]();
        console.log(`Stored "${key}"`, this.storedValues[key]);
        console.groupEnd();
      }

      for (let index: number = 0, length: number = this.particles.length; index < length; ++index) {
        this.storedValues["index"] = index;

        let transformation: f.Matrix4x4 = f.Matrix4x4.IDENTITY();

        // calculate local translation
        transformation.translate(this.evaluateClosureVector(this.effectDefinition.translation));

        // calculate rotation
        transformation.rotate(this.evaluateClosureVector(this.effectDefinition.rotation), true);

        // calculate world translation
        transformation.translate(this.evaluateClosureVector(this.effectDefinition.translationWorld), false);

        console.log("trans", transformation.toString());
        this.particles[index].mtxLocal.set(transformation);
      }
    }

    private evaluateClosureVector(_closureVector: ClosureVector): f.Vector3 {
      return new f.Vector3(_closureVector.x(), _closureVector.y(), _closureVector.z());
    }

    private createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
      let node: f.Node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
      node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
      return node;
    }
  }
}