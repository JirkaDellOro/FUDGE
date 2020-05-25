"use strict";
var Import;
(function (Import) {
    class ParticleSystem extends Import.f.Node {
        constructor(_mesh, _material, _transform, _numberOfParticles) {
            super("Particles");
            this.randomNumbers = [];
            this.storedValues = {};
            this.addComponent(new Import.f.ComponentTransform());
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
                // f.Debug.groupCollapsed(`Evaluate storage "${key}"`);
                this.storedValues[key] = this.effectDefinition.storage[key]();
                // f.Debug.log(`Stored "${key}"`, this.storedValues[key]);
                // f.Debug.groupEnd();
            }
            for (let index = 0, length = this.particles.length; index < length; ++index) {
                this.storedValues["index"] = index;
                let transformation = Import.f.Matrix4x4.IDENTITY();
                // calculate local translation
                transformation.translate(this.evaluateClosureVector(this.effectDefinition.translation));
                // calculate rotation
                transformation.rotate(this.evaluateClosureVector(this.effectDefinition.rotation), true);
                // calculate world translation
                transformation.translate(this.evaluateClosureVector(this.effectDefinition.translationWorld), false);
                // f.Debug.log("trans", transformation.toString());
                this.particles[index].mtxLocal.set(transformation);
                // calculate scaling
                this.particles[index].getComponent(Import.f.ComponentMesh).pivot.scaling = this.evaluateClosureVector(this.effectDefinition.scaling);
                //calculate color
                this.particles[index].getComponent(Import.f.ComponentMaterial).clrPrimary = new Import.f.Color(this.effectDefinition.color.r(), this.effectDefinition.color.g(), this.effectDefinition.color.b(), this.effectDefinition.color.a());
            }
        }
        evaluateClosureVector(_closureVector) {
            return new Import.f.Vector3(_closureVector.x(), _closureVector.y(), _closureVector.z());
        }
        createParticle(_mesh, _material) {
            let node = new Import.fAid.Node("Particle", Import.f.Matrix4x4.IDENTITY(), _material, _mesh);
            return node;
        }
    }
    Import.ParticleSystem = ParticleSystem;
})(Import || (Import = {}));
//# sourceMappingURL=ParticleSystem.js.map