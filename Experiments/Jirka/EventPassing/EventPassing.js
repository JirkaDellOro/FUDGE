"use strict";
var EventPassing;
(function (EventPassing) {
    window.addEventListener("load", init);
    class PointerEventEx extends PointerEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    class KeyboardEventEx extends KeyboardEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    class Port extends EventTarget {
        constructor() {
            super(...arguments);
            this.hndPointerEvent = (_event) => {
                let event = new PointerEventEx("ƒ" + _event.type, _event);
                event.canvasX = this.connected.width * event.pointerX / event.clientRect.width;
                event.canvasY = this.connected.height * event.pointerY / event.clientRect.height;
                this.dispatchEvent(event);
            };
            this.hndKeyboardEvent = (_event) => {
                let event = new KeyboardEventEx("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
        }
        activatePointerEvent(_type, _on) {
            this.activateEvent(this.connected, _type, this.hndPointerEvent, _on);
        }
        activateKeyboardEvent(_type, _on) {
            this.activateEvent(this.connected.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        activateEvent(_target, _type, _handler, _on) {
            _type = _type.slice(1); // chip the ƒlorentin
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }
    }
    function init(_event) {
        let element = document.querySelector("canvas");
        let port = new Port();
        let input = document.querySelector("input");
        input.addEventListener("keydown", hndEvent); // just for testing if two handler called
        port.connected = element;
        port.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
        port.addEventListener("\u0192pointerdown" /* DOWN */, hndEvent);
        port.activateKeyboardEvent("\u0192keyup" /* UP */, true);
        port.addEventListener("\u0192keyup" /* UP */, hndEvent);
    }
    function hndEvent(_event) {
        console.log(_event);
    }
})(EventPassing || (EventPassing = {}));
//# sourceMappingURL=EventPassing.js.map