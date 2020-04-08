/// <reference types="../../../../core/build/fudgecore" />
declare namespace Flame {
    import f = FudgeCore;
    class ParticleSystem extends f.Node {
        private particles;
        private normNumberOfParticles;
        private randomNumbers;
        private speed;
        private a;
        private b;
        private c;
        private d;
        private scaleXMin;
        private scaleXMax;
        constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number, _speed: number, _a: number, _b: number, _c: number, _d: number, _scaleXMin: number, _scaleXMax: number);
        update(_time: number): void;
        private polynom4;
        private scale;
        private createParticle;
        private randomNumberFrom;
    }
}
