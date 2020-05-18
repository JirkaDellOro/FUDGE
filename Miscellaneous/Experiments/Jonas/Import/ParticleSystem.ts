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
        let x: number = this.effectDefinition.translation["x"](); // TODO: define string only once
        let y: number = this.effectDefinition.translation["y"]();
        let z: number = this.effectDefinition.translation["z"]();
        transformation.translate(new f.Vector3(x, y, z));
        // this.particles[index].mtxLocal.translate(new f.Vector3(x, y, z));

        // calculate rotation
        x = this.effectDefinition.rotation["x"]();
        y = this.effectDefinition.rotation["y"]();
        z = this.effectDefinition.rotation["z"]();
        transformation.rotate(new f.Vector3(x, y, z), true);
        // this.particles[index].mtxLocal.rotate(new f.Vector3(x, y, z));

        // calculate world translation
        x = this.effectDefinition.translationWorld["x"]();
        y = this.effectDefinition.translationWorld["y"]();
        z = this.effectDefinition.translationWorld["z"]();
        transformation.translate(new f.Vector3(x, y, z), false);
        // this.particles[index].mtxLocal.translate(new f.Vector3(x, y, z), false);

        this.particles[index].mtxLocal.set(transformation);
      }
    }

    private createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
      let node: f.Node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
      node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
      return node;
    }
  }
}