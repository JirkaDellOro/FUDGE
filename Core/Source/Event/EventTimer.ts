namespace FudgeCore {
    export const enum EVENT_TIMER {
        CALL = "ƒlapse"
    }
    /**
     * An event that represents a call from a Timer
     * */
    export class EventTimer {
        public type: EVENT_TIMER = EVENT_TIMER.CALL;
        public target: Timer;
        public arguments: Object[];
        public firstCall: boolean = true;
        public lastCall: boolean = false;
        public count: number;

        constructor(_timer: Timer, ..._arguments: Object[]) {
            this.target = _timer;
            this.arguments = _arguments;
            this.firstCall = true;
        }
    }
}