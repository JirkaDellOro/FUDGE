"use strict";
var EventPassing;
(function (EventPassing) {
    window.addEventListener("load", init);
    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    class PointerEventƒ extends PointerEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    class DragDropEventƒ extends DragEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    class WheelEventƒ extends WheelEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    class Port extends EventTarget {
        constructor() {
            super(...arguments);
            this.hndDragDropEvent = (_event) => {
                let _dragevent = _event;
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
                let event = new DragDropEventƒ("ƒ" + _event.type, _dragevent);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            this.hndPointerEvent = (_event) => {
                let event = new PointerEventƒ("ƒ" + _event.type, _event);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            this.hndKeyboardEvent = (_event) => {
                let event = new KeyboardEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
            this.hndWheelEvent = (_event) => {
                let event = new WheelEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
        }
        activatePointerEvent(_type, _on) {
            this.activateEvent(this.connected, _type, this.hndPointerEvent, _on);
        }
        activateKeyboardEvent(_type, _on) {
            this.activateEvent(this.connected.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        activateDragDropEvent(_type, _on) {
            if (_type == "\u0192dragstart" /* START */)
                this.connected.draggable = _on;
            this.activateEvent(this.connected, _type, this.hndDragDropEvent, _on);
        }
        activateWheelEvent(_type, _on) {
            this.activateEvent(this.connected, _type, this.hndWheelEvent, _on);
        }
        addCanvasPosition(event) {
            event.canvasX = this.connected.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.connected.height * event.pointerY / event.clientRect.height;
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
        port.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        port.addEventListener("\u0192wheel" /* WHEEL */, hndEvent);
        port.activateDragDropEvent("\u0192dragstart" /* START */, true);
        port.addEventListener("\u0192dragstart" /* START */, hndEvent);
        port.activateDragDropEvent("\u0192dragover" /* OVER */, true);
        port.addEventListener("\u0192dragover" /* OVER */, hndEvent);
        port.activateDragDropEvent("\u0192drop" /* DROP */, true);
        port.addEventListener("\u0192drop" /* DROP */, hndEvent);
    }
    function hndEvent(_event) {
        if (_event.type == "\u0192drop" /* DROP */)
            console.log(_event.dataTransfer.getData("text"));
        console.log(_event);
    }
})(EventPassing || (EventPassing = {}));
//# sourceMappingURL=EventPassing.js.map