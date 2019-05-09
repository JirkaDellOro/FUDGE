"use strict";
var EventPassing;
(function (EventPassing) {
    window.addEventListener("load", init);
    class EventPort extends MouseEvent {
    }
    class Port extends EventTarget {
        constructor() {
            super(...arguments);
            this.hndEvent = (_event) => {
                // let event: EventPort = new EventPort(_event.type + "Port", _event);
                let event = new EventPort(_event.type + "Port", _event);
                this.dispatchEvent(event);
            };
        }
        processEvent(_type) {
            this.connected.addEventListener(_type, this.hndEvent);
        }
    }
    function init(_event) {
        let element = document.querySelector("fieldset");
        let port = new Port();
        port.connected = element;
        port.processEvent("mouseup");
        port.addEventListener("mouseupPort", hndPortEvent);
    }
    function hndPortEvent(_event) {
        console.log("external", _event);
    }
})(EventPassing || (EventPassing = {}));
//# sourceMappingURL=EventPassing.js.map