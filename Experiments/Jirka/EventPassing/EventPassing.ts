namespace EventPassing {
    window.addEventListener("load", init);

    const enum EVENT_KEYBOARD {
        UP = "ƒkeyup",
        DOWN = "ƒkeydown"
    }
    const enum EVENT_POINTER {
        UP = "ƒpointerup",
        DOWN = "ƒpointerdown"
    }
    const enum EVENT_DRAGDROP {
        DRAG = "ƒdrag",
        DROP = "ƒdrop",
        START = "ƒdragstart",
        END = "ƒdragend",
        OVER = "ƒdragover"
    }
    const enum EVENT_WHEEL {
        WHEEL = "ƒwheel"
    }

    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type: string, _event: KeyboardEventƒ) {
            super(type, _event);
        }
    }

    class PointerEventƒ extends PointerEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: PointerEventƒ) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }

    class DragDropEventƒ extends DragEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: DragDropEventƒ) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }

    class WheelEventƒ extends WheelEvent {
        constructor(type: string, _event: WheelEventƒ) {
            super(type, _event);
        }
    }

    class Port extends EventTarget {
        public connected: HTMLCanvasElement;

        public activatePointerEvent(_type: EVENT_POINTER, _on: boolean): void {
            this.activateEvent(this.connected, _type, this.hndPointerEvent, _on);
        }
        public activateKeyboardEvent(_type: EVENT_KEYBOARD, _on: boolean): void {
            this.activateEvent(this.connected.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        public activateDragDropEvent(_type: EVENT_DRAGDROP, _on: boolean): void {
            if (_type == EVENT_DRAGDROP.START)
                this.connected.draggable = _on;
            this.activateEvent(this.connected, _type, this.hndDragDropEvent, _on);
        }
        public activateWheelEvent(_type: EVENT_WHEEL, _on: boolean): void {
            this.activateEvent(this.connected, _type, this.hndWheelEvent, _on);
        }

        private hndDragDropEvent: EventListener = (_event: Event) => {
            let _dragevent: DragDropEventƒ = <DragDropEventƒ>_event;
            switch (_dragevent.type) {
                case "dragover":
                case "drop":
                    _dragevent.preventDefault();
                    _dragevent.dataTransfer.effectAllowed = "none";
                    break;
                case "dragstart":
                    _dragevent.dataTransfer.setData("text", "Hallo");
                    // TODO: check if there is no better solution to hide the ghost image of the draggable object
                    _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                    break;
            }
            let event: DragDropEventƒ = new DragDropEventƒ("ƒ" + _event.type, _dragevent);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        }

        private addCanvasPosition(event: PointerEventƒ | DragDropEventƒ): void {
            event.canvasX = this.connected.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.connected.height * event.pointerY / event.clientRect.height;
        }

        private hndPointerEvent: EventListener = (_event: Event) => {
            let event: PointerEventƒ = new PointerEventƒ("ƒ" + _event.type, <PointerEventƒ>_event);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        }

        private hndKeyboardEvent: EventListener = (_event: Event) => {
            let event: KeyboardEventƒ = new KeyboardEventƒ("ƒ" + _event.type, <KeyboardEventƒ>_event);
            this.dispatchEvent(event);
        }

        private hndWheelEvent: EventListener = (_event: Event) => {
            let event: WheelEventƒ = new WheelEventƒ("ƒ" + _event.type, <WheelEventƒ>_event);
            this.dispatchEvent(event);
        }

        private activateEvent(_target: EventTarget, _type: string, _handler: EventListener, _on: boolean): void {
            _type = _type.slice(1); // chip the ƒlorentin
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }
    }

    function init(_event: Event): void {
        let element: HTMLCanvasElement = document.querySelector("canvas");
        let port: Port = new Port();
        let input: HTMLInputElement = document.querySelector("input");
        input.addEventListener("keydown", hndEvent); // just for testing if two handler called

        port.connected = element;

        port.activatePointerEvent(EVENT_POINTER.DOWN, true);
        port.addEventListener(EVENT_POINTER.DOWN, hndEvent);

        port.activateKeyboardEvent(EVENT_KEYBOARD.UP, true);
        port.addEventListener(EVENT_KEYBOARD.UP, hndEvent);

        port.activateWheelEvent(EVENT_WHEEL.WHEEL, true);
        port.addEventListener(EVENT_WHEEL.WHEEL, hndEvent);

        port.activateDragDropEvent(EVENT_DRAGDROP.START, true);
        port.addEventListener(EVENT_DRAGDROP.START, hndEvent);
        port.activateDragDropEvent(EVENT_DRAGDROP.OVER, true);
        port.addEventListener(EVENT_DRAGDROP.OVER, hndEvent);
        port.activateDragDropEvent(EVENT_DRAGDROP.DROP, true);
        port.addEventListener(EVENT_DRAGDROP.DROP, hndEvent);
    }

    function hndEvent(_event: Event): void {
        if (_event.type == EVENT_DRAGDROP.DROP)
            console.log((<DragDropEventƒ>_event).dataTransfer.getData("text"));
        console.log(_event);
    }
}