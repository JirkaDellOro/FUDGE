declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentCustom extends ƒ.Component {
        static readonly iSubclass: number;
        private static message;
        constructor();
        private static showCompileMessage;
    }
}
declare namespace Script {
    class NoComponentScript {
        private static message;
        private static showCompileMessage;
    }
}
declare namespace Script2 {
    class SubScript {
        private static message;
        private static showCompileMessage;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class TimerMessage extends ƒ.ComponentScript {
        #private;
        prefix: string;
        count: number;
        constructor();
        hndTimer: (_event: ƒ.EventTimer) => void;
        hndAddComponent: (_event: Event) => void;
        hndRemoveComponent: (_event: Event) => void;
    }
}
