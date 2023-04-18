declare namespace Script {
    import ƒ = FudgeCore;
    class BallScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        velocity: number;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
}
