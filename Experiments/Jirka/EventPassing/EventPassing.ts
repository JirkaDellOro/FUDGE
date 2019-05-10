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

    class PointerEventEx extends PointerEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: PointerEventEx) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }

    class KeyboardEventEx extends KeyboardEvent {
        constructor(type: string, _event: KeyboardEventEx) {
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

        public hndPointerEvent: EventListener = (_event: Event) => {
            let event: PointerEventEx = new PointerEventEx("ƒ" + _event.type, <PointerEventEx>_event);
            event.canvasX = this.connected.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.connected.height * event.pointerY / event.clientRect.height;
            this.dispatchEvent(event);
        }

        public hndKeyboardEvent: EventListener = (_event: Event) => {
            let event: KeyboardEventEx = new KeyboardEventEx("ƒ" + _event.type, <KeyboardEventEx>_event);
            this.dispatchEvent(event);
        }

        public activateEvent(_target: EventTarget, _type: string, _handler: EventListener, _on: boolean): void {
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
    }

    function hndEvent(_event: Event): void {
        console.log(_event);
    }
}