"use strict";
var EventPassing;
(function (EventPassing) {
    window.addEventListener("load", init);
    class EventPort extends MouseEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.canvasX = _event.clientX - target.getClientRects()[0].left;
            this.canvasY = _event.clientY - target.getClientRects()[0].top;
        }
    }
    class Port extends EventTarget {
        constructor() {
            super(...arguments);
            this.hndEvent = (_event) => {
                let event = new EventPort(_event.type + "Port", _event);
                this.dispatchEvent(event);
            };
        }
        processEvent(_type) {
            this.connected.addEventListener(_type, this.hndEvent);
        }
    }
    function init(_event) {
        let element = document.querySelector("canvas");
        let port = new Port();
        port.connected = element;
        port.processEvent("mousemove");
        port.addEventListener("mousemovePort", hndPortEvent);
    }
    function hndPortEvent(_event) {
        console.log("external", _event);
    }
})(EventPassing || (EventPassing = {}));
//# sourceMappingURL=EventPassing.js.map