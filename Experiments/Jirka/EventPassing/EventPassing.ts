namespace EventPassing {
    window.addEventListener("load", init);
    class EventPort extends MouseEvent {

    }

    class Port extends EventTarget {
        public connected: HTMLElement;

        public processEvent(_type: string): void {
            this.connected.addEventListener(_type, this.hndEvent);
        }

        public hndEvent = (_event: Event) => {
            // let event: EventPort = new EventPort(_event.type + "Port", _event);
            let event: EventPort = new EventPort(_event.type + "Port", _event);
            this.dispatchEvent(event);
        }
    }

    function init(_event: Event): void {
        let element: HTMLElement = document.querySelector("fieldset");
        let port: Port = new Port();

        port.connected = element;
        port.processEvent("mouseup");

        port.addEventListener("mouseupPort", hndPortEvent);
    }

    function hndPortEvent(_event: Event): void {
        console.log("external", _event);
    }
}