"use strict";
var fromJSON;
(function (fromJSON) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    let OPERATION;
    (function (OPERATION) {
        OPERATION["MULTIPLICATION"] = "Multiplication";
        OPERATION["ADDITION"] = "Addition";
        OPERATION["DIVISION"] = "Division";
        OPERATION["MODULO"] = "Modulo";
        OPERATION["POLYNOM3"] = "polynom3";
        OPERATION["RANDOM"] = "random";
    })(OPERATION || (OPERATION = {}));
    class ClosureComponent {
    }
    class ClosureComposite extends ClosureComponent {
        constructor() {
            super(...arguments);
            this.components = [];
        }
        getClosure() {
            return createClosureAddition(this.components[0].getClosure(), this.components[1].getClosure());
        }
    }
    class ClosureLeaf extends ClosureComponent {
        constructor(_value) {
            super();
            this.value = _value;
        }
        getClosure() {
            let v = this.value;
            return function value() {
                return v;
            };
        }
    }
    class ParticleSystem extends f.Node {
        constructor(_mesh, _material, _transform, _numberOfParticles, _speed, _a, _b, _c, _d, _scaleXMin, _scaleXMax) {
            super("Particles");
            this.randomNumbers = [];
            this.addComponent(new f.ComponentTransform());
            this.cmpTransform.local = _transform;
            this.speed = _speed;
            for (let i = 0; i < _numberOfParticles; i++) {
                this.addChild(this.createParticle(_mesh, _material));
            }
            this.particles = this.getChildrenByName("Particle");
            this.normNumberOfParticles = 1 / _numberOfParticles;
            for (let i = 0; i < 1000; i++) {
                this.randomNumbers.push(Math.random());
            }
        }
        update(_time) {
            let inNormTime = _time * this.speed % 1;
            for (let index = 0, length = this.particles.length; index < length; ++index) {
                let inParticle = index * this.normNumberOfParticles; // - this.normNumberOfParticles / 2;
                let inNormParticleTime = (inParticle + inNormTime) % 1;
                let x = 1;
                let y = inNormParticleTime;
                let z = 0;
                let translation = new f.Vector3(x, y, z);
                this.particles[index].mtxLocal.translation = translation;
            }
        }
        polynom3(_x, _a, _b, _c, _d) {
            return _a * Math.pow(_x, 3) + _b * Math.pow(_x, 2) + _c * _x + _d;
        }
        createParticle(_mesh, _material) {
            let node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
            node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
            return node;
        }
        randomNumberFrom(_index, _min, _max) {
            return this.randomNumbers[_index] * (_max - _min) + _min;
        }
        generateClosure(_filename) {
            let file = new XMLHttpRequest();
            file.open("GET", _filename, false);
            file.send();
            let root = JSON.parse(file.responseText);
        }
        traverseTree(_composite) {
            let closure;
            switch (_composite.operation) {
                case OPERATION.ADDITION:
                    closure = createClosureAddition(_composite.arguments[0], _composite.arguments[1]);
                    break;
            }
        }
    }
    fromJSON.ParticleSystem = ParticleSystem;
    function createClosureLinear(_xStart = 0, _xEnd = 1, _yStart = 0, _yEnd = 1) {
        let f = function (_x) {
            // console.log(_xStart, _xEnd, _yStart, _yEnd);
            let y = _yStart + (_x - _xStart) * (_yEnd - _yStart) / (_xEnd - _xStart);
            return y;
        };
        return f;
    }
    function createClosureAddition(_a, _b) {
        return function () {
            return _a() + _b();
        };
    }
})(fromJSON || (fromJSON = {}));
//# sourceMappingURL=ParticleSystem.js.map