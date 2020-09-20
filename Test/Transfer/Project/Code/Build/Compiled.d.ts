declare namespace Script {
    import ƒ = FudgeCore;
    class TimerMessage extends ƒ.ComponentScript {
        prefix: string;
        count: number;
        private timer;
        constructor();
        hndTimer: (_event: ƒ.EventTimer) => void;
        hndAddComponent: (_event: Event) => void;
        hndRemoveComponent: (_event: Event) => void;
    }
}
