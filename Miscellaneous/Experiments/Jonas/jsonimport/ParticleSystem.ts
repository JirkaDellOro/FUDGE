namespace fromJSON {
  import f = FudgeCore;
  import fAid = FudgeAid;

  enum OPERATION {
    MULTIPLICATION = "Multiplication",
    ADDITION = "Addition",
    DIVISION = "Division",
    MODULO = "Modulo",
    POLYNOM3 = "polynom3",
    RANDOM = "random"
  }

  interface Composite {
    operation: OPERATION;
    arguments: (number | string | Composite)[];
  }

  abstract class ClosureComponent {
    public abstract getClosure(): Function;
  }

  class ClosureComposite extends ClosureComponent {
    private components: ClosureComponent[] = [];
    public getClosure(): Function {
      return createClosureAddition(this.components[0].getClosure(), this.components[1].getClosure())
    }
  }

  class ClosureLeaf extends ClosureComponent {
    private value: number;

    constructor(_value: number) {
      super();
      this.value = _value;
    }

    public getClosure(): Function {
      let v: number = this.value;
      return function value(): number {
        return v;
      };
    }
  }

  export class ParticleSystem extends f.Node {
    private particles: f.Node[];
    private normNumberOfParticles: number;
    private randomNumbers: number[] = [];
    private speed: number;

    constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number, _speed: number, _a: number, _b: number, _c: number, _d: number, _scaleXMin: number, _scaleXMax: number) {
      super("Particles");
      this.addComponent(new f.ComponentTransform());
      this.cmpTransform.local = _transform;
      this.speed = _speed;

      for (let i: number = 0; i < _numberOfParticles; i++) {
        this.addChild(this.createParticle(_mesh, _material));
      }
      this.particles = this.getChildrenByName("Particle");
      this.normNumberOfParticles = 1 / _numberOfParticles;

      for (let i: number = 0; i < 1000; i++) {
        this.randomNumbers.push(Math.random());
      }
    }

    public update(_time: number): void {
      let inNormTime: number = _time * this.speed % 1;
      for (let index: number = 0, length: number = this.particles.length; index < length; ++index) {
        let inParticle: number = index * this.normNumberOfParticles; // - this.normNumberOfParticles / 2;
        let inNormParticleTime: number = (inParticle + inNormTime) % 1;
        let x: number = 1;
        let y: number = inNormParticleTime;
        let z: number = 0;
        let translation: f.Vector3 = new f.Vector3(x, y, z);
        this.particles[index].mtxLocal.translation = translation;
      }
    }

    private polynom3(_x: number, _a: number, _b: number, _c: number, _d: number): number {
      return _a * Math.pow(_x, 3) + _b * Math.pow(_x, 2) + _c * _x + _d;
    }

    private createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
      let node: f.Node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
      node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
      return node;
    }

    private randomNumberFrom(_index: number, _min: number, _max: number): number {
      return this.randomNumbers[_index] * (_max - _min) + _min;
    }

    private generateClosure(_filename: string): void {
      let file: XMLHttpRequest = new XMLHttpRequest();
      file.open("GET", _filename, false);
      file.send();
      let root: Composite = JSON.parse(file.responseText);
    }

    private traverseTree(_composite: Composite): void {
      let closure: Function;
      switch (_composite.operation) {
        case OPERATION.ADDITION:
          closure = createClosureAddition(_composite.arguments[0], _composite.arguments[1])
          break;
      }
    }
  }

  function createClosureLinear(_xStart: number = 0, _xEnd: number = 1, _yStart: number = 0, _yEnd: number = 1): Function {
    let f: Function = function (_x: number): number {
      // console.log(_xStart, _xEnd, _yStart, _yEnd);
      let y: number = _yStart + (_x - _xStart) * (_yEnd - _yStart) / (_xEnd - _xStart);
      return y;
    };
    return f;
  }

  function createClosureAddition(_a: Function, _b: Function) {
    return function (): number {
      return _a() + _b();
    };
  }
}