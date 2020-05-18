/// <reference types="../../../../core/build/fudgecore" />
declare namespace Import {
    import f = FudgeCore;
    class ParticleSystem extends f.Node {
        private particles;
        private randomNumbers;
        private storedValues;
        private effectDefinition;
        constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number);
        update(_time: number): void;
        private createParticle;
    }
}
