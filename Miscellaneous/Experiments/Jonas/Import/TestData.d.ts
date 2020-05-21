declare namespace Import {
    interface ParticleEffectData {
        storage?: ParticleData;
        translation?: ParticleVectorData;
        rotation?: ParticleVectorData;
        translationWorld?: ParticleVectorData;
        scaling?: ParticleVectorData;
    }
    interface ParticleData {
        [key: string]: ClosureDataa;
    }
    interface ParticleVectorData {
        x?: ClosureDataa;
        y?: ClosureDataa;
        z?: ClosureDataa;
    }
    interface ClosureData {
        function: string;
        parameters: (ClosureData | string | number)[];
        preEvaluate?: boolean;
    }
    interface ClosureDataFunction {
        function: string;
        parameters: ClosureDataa[];
        preEvaluate?: boolean;
    }
    type ClosureDataa = ClosureDataFunction | string | number;
    let data: ParticleEffectData;
}
