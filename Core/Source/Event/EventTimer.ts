namespace FudgeCore {
    export const enum EVENT_TIMER {
        CALL = "ƒlapse"
    }

    export class EventTimer {
        public type: EVENT_TIMER = EVENT_TIMER.CALL;
        public target: Timer;
        public arguments: Object[];
        public firstCall: boolean = true;
        public lastCall: boolean = false;

        constructor(_timer: Timer, ..._arguments: Object[]) {
            this.target = _timer;
            this.arguments = _arguments;
            this.firstCall = true;
        }
    }
}