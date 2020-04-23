"use strict";
var Flame;
(function (Flame) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    class ParticleSystem extends f.Node {
        constructor(_mesh, _material, _transform, _numberOfParticles, _speed, _a, _b, _c, _d, _scaleXMin, _scaleXMax) {
            super("Particles");
            this.randomNumbers = [];
            this.polynom4 = function (_x, _a, _b, _c, _d) {
                return _a * Math.pow(_x, 3) + _b * Math.pow(_x, 2) + _c * _x + _d;
            };
            this.addComponent(new f.ComponentTransform());
            this.cmpTransform.local = _transform;
            this.speed = _speed;
            this.a = _a;
            this.b = _b;
            this.c = _c;
            this.d = _d;
            this.scaleXMax = _scaleXMax;
            this.scaleXMin = _scaleXMin;
            for (let i = 0; i < _numberOfParticles; i++) {
                this.addChild(this.createParticle(_mesh, _material));
            }
            this.particles = this.getChildrenByName("Particle");
            this.normNumberOfParticles = 1 / _numberOfParticles;
            for (let i = 0; i < 1000; i++) {
                this.randomNumbers.push(Math.random());
            }
            console.log(this.randomNumbers.toString());
        }
        update(_time) {
            let inNormTime = _time * this.speed % 1;
            for (let index = 0, length = this.particles.length; index < length; ++index) {
                // let inParticle: number = index * this.normNumberOfParticles; // - this.normNumberOfParticles / 2;
                // let inNormParticleTime: number = (inParticle + inNormTime) % 1;
                let x = 0; //Math.sqrt(inNormTime); //this.scale(this.polynom4(inNormParticleTime, this.a, this.b, this.c, this.d), this.randomNumberFrom(index, this.scaleXMin, this.scaleXMax));
                let y = Math.sqrt(inNormTime) * this.randomNumbers[index + 1]; //inNormParticleTime;
                let z = 0;
                let translation = new f.Vector3(x, y, z);
                translation.transform(f.Matrix4x4.ROTATION_Z(this.randomNumbers[index] * 360));
                translation.add(f.Vector3.Y(-1 / 2 * 10 * inNormTime * inNormTime));
                // translation.y = translation.y + translation.y * inNormTime - 1 / 2 * 10 * inNormTime * inNormTime;
                this.particles[index].mtxLocal.translation = translation;
            }
        }
        scale(_value, _by) {
            return _value * _by;
        }
        createParticle(_mesh, _material) {
            let node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
            node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
            return node;
        }
        randomNumberFrom(_index, _min, _max) {
            return this.randomNumbers[_index] * (_max - _min) + _min;
        }
    }
    Flame.ParticleSystem = ParticleSystem;
})(Flame || (Flame = {}));
//# sourceMappingURL=ParticleSystem.js.map