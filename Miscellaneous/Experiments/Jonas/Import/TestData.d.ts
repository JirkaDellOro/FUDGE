declare namespace Import {
    interface ParticleEffectData {
        storage?: ParticleData;
        translation?: ParticleData;
        rotation?: ParticleData;
        translationWorld?: ParticleData;
    }
    interface ParticleData {
        [key: string]: ClosureData;
    }
    interface ClosureData {
        function: string;
        parameters: (ClosureData | string | number)[];
        preEvaluate?: boolean;
    }
    let data: ParticleEffectData;
}
