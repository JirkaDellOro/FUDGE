declare namespace Import {
    interface ParticleEffectData {
        storage?: ParticleData;
        translation?: ParticleVectorData;
        rotation?: ParticleVectorData;
        translationWorld?: ParticleVectorData;
        scaling?: ParticleVectorData;
        color?: ParticleColorData;
    }
    interface ParticleData {
        [key: string]: ClosureData;
    }
    interface ParticleVectorData {
        x?: ClosureData;
        y?: ClosureData;
        z?: ClosureData;
    }
    interface ParticleColorData {
        r?: ClosureData;
        g?: ClosureData;
        b?: ClosureData;
        a?: ClosureData;
    }
    interface ClosureDataFunction {
        function: string;
        parameters: ClosureData[];
        preEvaluate?: boolean;
    }
    type ClosureData = ClosureDataFunction | string | number;
    let data: ParticleEffectData;
}
