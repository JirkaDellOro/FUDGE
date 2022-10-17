declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ParticleSystemTimeController extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        constructor();
        get scale(): number;
        set scale(_value: number);
        get time(): number;
        set time(_value: number);
        hndEvent: (_event: Event) => void;
        getMutatorForUserInterface(): ƒ.MutatorForUserInterface;
    }
}
