declare namespace Import {
    interface ParticleEffectData {
        storage?: ParticleData;
        translation?: ParticleVectorData;
        rotation?: ParticleVectorData;
        translationWorld?: ParticleVectorData;
        scaling?: ParticleVectorData;
    }
    interface ParticleData {
        [key: string]: ClosureData;
    }
    interface ParticleVectorData {
        x?: ClosureData;
        y?: ClosureData;
        z?: ClosureData;
    }
    interface ClosureData {
        function: string;
        parameters: (ClosureData | string | number)[];
        preEvaluate?: boolean;
    }
    let data: ParticleEffectData;
}
