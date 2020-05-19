"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
var Import;
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
(function (Import) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    // export interface StoredValues {
    //   [key: string]: number;
    // }
    class ParticleSystem extends f.Node {
        constructor(_mesh, _material, _transform, _numberOfParticles) {
            super("Particles");
            this.randomNumbers = [];
            this.storedValues = {};
            this.addComponent(new f.ComponentTransform());
            this.cmpTransform.local = _transform;
            for (let i = 0; i < _numberOfParticles; i++) {
                this.addChild(this.createParticle(_mesh, _material));
            }
            this.particles = this.getChildrenByName("Particle");
            for (let i = 0; i < 1000; i++) {
                this.randomNumbers.push(Math.random());
            }
            this.storedValues = {
                "time": 0,
                "index": 0,
                "size": _numberOfParticles
            };
            let effectImporter = new Import.ParticleEffectImporter(this.storedValues, this.randomNumbers);
            this.effectDefinition = effectImporter.parseFile(Import.data);
        }
        update(_time) {
            this.storedValues["time"] = _time;
            // evaluate storage
            for (const key in this.effectDefinition.storage) {
                console.groupCollapsed(`Evaluate storage "${key}"`);
                this.storedValues[key] = this.effectDefinition.storage[key]();
                console.log(`Stored "${key}"`, this.storedValues[key]);
                console.groupEnd();
            }
            for (let index = 0, length = this.particles.length; index < length; ++index) {
                this.storedValues["index"] = index;
                let transformation = f.Matrix4x4.IDENTITY();
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
        evaluateClosureVector(_closureVector) {
            return new f.Vector3(_closureVector.x(), _closureVector.y(), _closureVector.z());
        }
        createParticle(_mesh, _material) {
            let node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
            node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
            return node;
        }
    }
    Import.ParticleSystem = ParticleSystem;
})(Import || (Import = {}));
//# sourceMappingURL=ParticleSystem.js.map