namespace FudgeCore {
    export const enum EVENT_WHEEL {
        WHEEL = "ƒwheel"
    }
    
    export class EventWheel extends WheelEvent {
        constructor(type: string, _event: EventWheel) {
            super(type, _event);
        }
    }
}