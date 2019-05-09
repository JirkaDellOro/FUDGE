namespace EventPassing {
    window.addEventListener("load", init);
    class EventPort extends MouseEvent {
        public canvasX: number;
        public canvasY: number;

        constructor(type: string, _event: MouseEvent) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.canvasX = _event.clientX - target.getClientRects()[0].left;
            this.canvasY = _event.clientY - target.getClientRects()[0].top;
        }
    }

    class Port extends EventTarget {
        public connected: HTMLElement;

        public processEvent(_type: string): void {
            this.connected.addEventListener(_type, this.hndEvent);
        }

        public hndEvent: EventListener = (_event: Event) => {
            let event: EventPort = new EventPort(_event.type + "Port", <MouseEvent>_event);
            this.dispatchEvent(event);
        }
    }

    function init(_event: Event): void {
        let element: HTMLElement = document.querySelector("canvas");
        let port: Port = new Port();

        port.connected = element;
        port.processEvent("mousemove");

        port.addEventListener("mousemovePort", hndPortEvent);
    }

    function hndPortEvent(_event: Event): void {
        console.log("external", _event);
    }
}