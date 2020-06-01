namespace FudgeCore {

  export interface StoredValues {
    [key: string]: number;
  }
  
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    private particles: Node[];
    private randomNumbers: number[] = [];
    private storedValues: StoredValues = {};
    private effectDefinition: ParticleEffectDefinition;

    constructor(_filename: string = null, _numberOfParticles: number = null) {
      super();

      for (let i: number = 0; i < 1000; i++) {
        this.randomNumbers.push(Math.random());
      }

      this.storedValues = {
        "time": 0,
        "index": 0,
        "size": _numberOfParticles
      };

      let effectImporter: ParticleEffectImporter = new ParticleEffectImporter(this.storedValues, this.randomNumbers);
      this.effectDefinition = effectImporter.importFile(_filename);

      // evaluate system storage
      this.evaluateClosureStorage(this.effectDefinition.system);
    }

    public updateParticleEffect(_time: number): void {
      this.storedValues["time"] = _time;

      // evaluate update storage
      this.evaluateClosureStorage(this.effectDefinition.update);

      for (let index: number = 0, length: number = this.particles.length; index < length; ++index) {
        this.storedValues["index"] = index;

        // evaluate particle storage
        this.evaluateClosureStorage(this.effectDefinition.particle);

        let transformation: Matrix4x4 = Matrix4x4.IDENTITY();

        // calculate local translation
        transformation.translate(this.evaluateClosureVector(this.effectDefinition.translation));

        // calculate rotation
        transformation.rotate(this.evaluateClosureVector(this.effectDefinition.rotation), true);

        // calculate world translation
        transformation.translate(this.evaluateClosureVector(this.effectDefinition.translationWorld), false);

        // Debug.log("trans", transformation.toString());
        this.particles[index].mtxLocal.set(transformation);

        // calculate scaling
        this.particles[index].getComponent(ComponentMesh).pivot.scaling = this.evaluateClosureVector(this.effectDefinition.scaling);

        //calculate color
        this.particles[index].getComponent(ComponentMaterial).clrPrimary = new Color(this.effectDefinition.color.r(), this.effectDefinition.color.g(), this.effectDefinition.color.b(), this.effectDefinition.color.a());
      }
    }

    public createParticles(_mesh: Mesh, _material: Material): void {
      let container: Node = this.getContainer();
      for (let i: number = 0; i < this.storedValues["size"]; i++) {
        container.addChild(this.createParticle(_mesh, _material));
      }
      this.particles = container.getChildrenByName("Particle");
    }

    private evaluateClosureStorage(_closureStorage: ClosureStorage): void {
      for (const key in _closureStorage) {
        this.storedValues[key] = _closureStorage[key]();
      }
    }

    private evaluateClosureVector(_closureVector: ClosureVector): Vector3 {
      return new Vector3(
        _closureVector.x(), _closureVector.y(), _closureVector.z());
    }

    private createParticle(_mesh: Mesh, _material: Material): Node {
      let node: Node = new Node("Particle");
      node.addComponent(new ComponentMaterial(_material));
      node.addComponent(new ComponentMesh(_mesh));
      node.addComponent(new ComponentTransform(Matrix4x4.IDENTITY()));
      return node;
    }
  }
}