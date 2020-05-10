declare namespace Import {
    interface SystemData {
        particle: Particle;
    }
    interface Particle {
        store: ParticleData;
        translation: ParticleData;
    }
    interface ParticleData {
        [key: string]: ParticleClosure;
    }
    interface ParticleClosure {
        operation: string;
        arguments: (ParticleClosure | string | number)[];
    }
    let data: SystemData;
}
