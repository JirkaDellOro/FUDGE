declare namespace Import {
    interface ParticleSystemData {
        system?: ParticleData;
        particle: Particle;
    }
    interface Particle {
        store?: ParticleData;
        translation?: ParticleData;
        rotation?: ParticleData;
    }
    interface ParticleData {
        [key: string]: ClosureData;
    }
    interface ClosureData {
        operation: string;
        arguments: (ClosureData | string | number)[];
    }
    let data: ParticleSystemData;
}
