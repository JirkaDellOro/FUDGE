declare namespace Import {
    interface ParticleEffectData {
        system?: ParticleStorageData;
        update?: ParticleStorageData;
        particle?: ParticleStorageData;
        translation?: ParticleVectorData;
        rotation?: ParticleVectorData;
        translationWorld?: ParticleVectorData;
        scaling?: ParticleVectorData;
        color?: ParticleColorData;
    }
    interface ParticleStorageData {
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
    }
    type ClosureData = ClosureDataFunction | string | number;
    let data: ParticleEffectData;
}
