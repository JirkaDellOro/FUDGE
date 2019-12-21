namespace FudgeCore {
    export const enum EVENT_WHEEL {
        WHEEL = "ƒwheel"
    }
    
    export class WheelEventƒ extends WheelEvent {
        constructor(type: string, _event: WheelEventƒ) {
            super(type, _event);
        }
    }
}