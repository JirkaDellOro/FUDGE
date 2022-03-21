namespace FudgeCore {
    export const enum EVENT_WHEEL {
        WHEEL = "ƒwheel"
    }
    /**
     * A supclass of WheelEvent. Events that occur due to the user moving a mouse wheel or similar input device.
     * */
    export class EventWheel extends WheelEvent {
        constructor(type: string, _event: EventWheel) {
            super(type, _event);
        }
    }
}