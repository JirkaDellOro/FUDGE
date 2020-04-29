/// <reference types="../../../../core/build/fudgecore" />
declare namespace fromJSON {
    import f = FudgeCore;
    class ParticleSystem extends f.Node {
        private particles;
        private normNumberOfParticles;
        private randomNumbers;
        private speed;
        constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number, _speed: number, _a: number, _b: number, _c: number, _d: number, _scaleXMin: number, _scaleXMax: number);
        update(_time: number): void;
        private polynom3;
        private createParticle;
        private randomNumberFrom;
        private generateClosure;
        private traverseTree;
    }
}
