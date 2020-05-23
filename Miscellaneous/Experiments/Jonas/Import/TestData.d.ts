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
    interface ClosureDataFunction {
        function: string;
        parameters: ClosureData[];
        preEvaluate?: boolean;
    }
    type ClosureData = ClosureDataFunction | string | number;
    let data: ParticleEffectData;
}
