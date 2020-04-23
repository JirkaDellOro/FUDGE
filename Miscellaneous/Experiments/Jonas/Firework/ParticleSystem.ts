namespace Firework {
  import f = FudgeCore;
  import fAid = FudgeAid;

  export class ParticleSystem extends f.Node {
    private particles: f.Node[];
    private normNumberOfParticles: number;
    private randomNumbers: number[] = [];
    private speed: number;
    private a: number;
    private b: number;
    private c: number;
    private d: number;
    private scaleXMin: number;
    private scaleXMax: number;

    constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number, _speed: number, _a: number, _b: number, _c: number, _d: number, _scaleXMin: number, _scaleXMax: number) {
      super("Particles");
      this.addComponent(new f.ComponentTransform());
      this.cmpTransform.local = _transform;
      this.speed = _speed;
      this.a = _a;
      this.b = _b;
      this.c = _c;
      this.d = _d;
      this.scaleXMax = _scaleXMax;
      this.scaleXMin = _scaleXMin;

      for (let i: number = 0; i < _numberOfParticles; i++) {
        this.addChild(this.createParticle(_mesh, _material));
      }
      this.particles = this.getChildrenByName("Particle");
      this.normNumberOfParticles = 1 / _numberOfParticles;

      for (let i: number = 0; i < 1000; i++) {
        this.randomNumbers.push(Math.random());
      }

      console.log(this.randomNumbers.toString());
    }

    public update(_time: number): void {
      let inNormTime: number = _time * this.speed % 1;
      for (let index: number = 0, length: number = this.particles.length; index < length; ++index) {
        // let inParticle: number = index * this.normNumberOfParticles; // - this.normNumberOfParticles / 2;
        // let inNormParticleTime: number = (inParticle + inNormTime) % 1;
        let x: number = 0; //Math.sqrt(inNormTime); //this.scale(this.polynom4(inNormParticleTime, this.a, this.b, this.c, this.d), this.randomNumberFrom(index, this.scaleXMin, this.scaleXMax));
        let y: number = Math.sqrt(inNormTime) * this.randomNumbers[index + 1]; //inNormParticleTime;
        let z: number = 0;
        let translation: f.Vector3 = new f.Vector3(x, y, z);
        translation.transform(f.Matrix4x4.ROTATION_Z(this.randomNumbers[index] * 360));
        translation.add(f.Vector3.Y(- 1 / 2 * 10 * inNormTime * inNormTime));
        // translation.y = translation.y + translation.y * inNormTime - 1 / 2 * 10 * inNormTime * inNormTime;
        this.particles[index].mtxLocal.translation = translation;
      }
    }

    public polynom4: (_x: number, _a: number, _b: number, _c: number, _d: number) => number
      = function (_x: number, _a: number, _b: number, _c: number, _d: number): number {
        return _a * Math.pow(_x, 3) + _b * Math.pow(_x, 2) + _c * _x + _d;
      };

    private scale(_value: number, _by: number): number {
      return _value * _by;
    }

    private createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
      let node: f.Node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
      node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
      return node;
    }

    private randomNumberFrom(_index: number, _min: number, _max: number): number {
      return this.randomNumbers[_index] * (_max - _min) + _min;
    }
  }
}