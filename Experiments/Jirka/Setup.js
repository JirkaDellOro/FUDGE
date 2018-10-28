/**
 * Class Setup !!
 * Basic functionality for simple creation of a template for the programming course at HFU
 *
 * @author Prof. Jirka R. Dell'Oro-Friedl
 */
/** The painter-object enables drawing on the 2D-canvas. It's type is CanvasRenderingContext2D*/
var crc2;
/** Keycodes to use with Setup.getKeyPressed */
var KEYCODE;
(function (KEYCODE) {
    KEYCODE[KEYCODE["A"] = 65] = "A";
    KEYCODE[KEYCODE["S"] = 83] = "S";
    KEYCODE[KEYCODE["D"] = 68] = "D";
    KEYCODE[KEYCODE["W"] = 87] = "W";
    KEYCODE[KEYCODE["UP"] = 38] = "UP";
    KEYCODE[KEYCODE["DOWN"] = 40] = "DOWN";
    KEYCODE[KEYCODE["LEFT"] = 37] = "LEFT";
    KEYCODE[KEYCODE["RIGHT"] = 39] = "RIGHT";
    KEYCODE[KEYCODE["SPACE"] = 32] = "SPACE";
    KEYCODE[KEYCODE["Q"] = 81] = "Q";
    KEYCODE[KEYCODE["E"] = 69] = "E";
    KEYCODE[KEYCODE["ALT"] = 18] = "ALT";
    KEYCODE[KEYCODE["CTRL"] = 17] = "CTRL";
    KEYCODE[KEYCODE["SHIFT"] = 16] = "SHIFT";
    KEYCODE[KEYCODE["TAB"] = 9] = "TAB";
    KEYCODE[KEYCODE["ENTER"] = 13] = "ENTER";
    KEYCODE[KEYCODE["BACKSPACE"] = 8] = "BACKSPACE";
    KEYCODE[KEYCODE["PAGEUP"] = 33] = "PAGEUP";
    KEYCODE[KEYCODE["PAGEDOWN"] = 34] = "PAGEDOWN";
    KEYCODE[KEYCODE["ESC"] = 27] = "ESC";
    KEYCODE[KEYCODE["F1"] = 112] = "F1";
    KEYCODE[KEYCODE["F2"] = 113] = "F2";
    KEYCODE[KEYCODE["F3"] = 114] = "F3";
    KEYCODE[KEYCODE["F4"] = 115] = "F4";
    KEYCODE[KEYCODE["F5"] = 116] = "F5";
    KEYCODE[KEYCODE["F6"] = 117] = "F6";
    KEYCODE[KEYCODE["F7"] = 118] = "F7";
    KEYCODE[KEYCODE["F8"] = 119] = "F8";
    KEYCODE[KEYCODE["F9"] = 120] = "F9";
    KEYCODE[KEYCODE["F10"] = 121] = "F10";
    KEYCODE[KEYCODE["F11"] = 122] = "F11";
    KEYCODE[KEYCODE["F12"] = 123] = "F12";
    KEYCODE[KEYCODE["NUMBER_0"] = 48] = "NUMBER_0";
    KEYCODE[KEYCODE["NUMBER_1"] = 49] = "NUMBER_1";
    KEYCODE[KEYCODE["NUMBER_2"] = 50] = "NUMBER_2";
    KEYCODE[KEYCODE["NUMBER_3"] = 51] = "NUMBER_3";
    KEYCODE[KEYCODE["NUMBER_4"] = 52] = "NUMBER_4";
    KEYCODE[KEYCODE["NUMBER_5"] = 53] = "NUMBER_5";
    KEYCODE[KEYCODE["NUMBER_6"] = 54] = "NUMBER_6";
    KEYCODE[KEYCODE["NUMBER_7"] = 55] = "NUMBER_7";
    KEYCODE[KEYCODE["NUMBER_8"] = 56] = "NUMBER_8";
    KEYCODE[KEYCODE["NUMBER_9"] = 57] = "NUMBER_9";
})(KEYCODE || (KEYCODE = {}));
;
/** Eventtypes to use with Setup.addEventListener */
var EVENTTYPE;
(function (EVENTTYPE) {
    EVENTTYPE[EVENTTYPE["MOUSEDOWN"] = 0] = "MOUSEDOWN";
    EVENTTYPE[EVENTTYPE["MOUSEUP"] = 1] = "MOUSEUP";
    EVENTTYPE[EVENTTYPE["MOUSEMOVE"] = 2] = "MOUSEMOVE";
    EVENTTYPE[EVENTTYPE["TOUCHSTART"] = 3] = "TOUCHSTART";
    EVENTTYPE[EVENTTYPE["TOUCHEND"] = 4] = "TOUCHEND";
    EVENTTYPE[EVENTTYPE["TOUCHMOVE"] = 5] = "TOUCHMOVE";
    EVENTTYPE[EVENTTYPE["KEYDOWN"] = 6] = "KEYDOWN";
    EVENTTYPE[EVENTTYPE["KEYUP"] = 7] = "KEYUP";
    EVENTTYPE[EVENTTYPE["LOAD"] = 8] = "LOAD";
})(EVENTTYPE || (EVENTTYPE = {}));
;
class Setup {
    /** Creates the canvas and sets up tracking for mouse, touch and keys */
    static init() {
        document.body.style.margin = "0"; //"{margin=0;padding=0;}"
        var c = document.createElement("canvas");
        c.id = "crc2";
        document.body.appendChild(c);
        crc2 = c.getContext("2d");
        Setup.size(100, 100);
        window.addEventListener("touchmove", Setup.updateMouseByTouch);
        window.addEventListener("touchstart", Setup.updateMouseByTouch);
        window.addEventListener("touchend", Setup.updateMouseByTouch);
        window.addEventListener("mousedown", Setup.updateMouse);
        window.addEventListener("mouseup", Setup.updateMouse);
        window.addEventListener("mousemove", Setup.updateMouse);
        window.addEventListener("keyup", Setup.trackKeypress);
        window.addEventListener("keydown", Setup.trackKeypress);
        window.addEventListener("load", Setup.printLinks);
    }
    static getEventTypeString(_eventtype) {
        var eventString = EVENTTYPE[_eventtype].toLowerCase();
        return eventString;
    }
    /** Maintains the array of currenty pressed keys */
    static trackKeypress(_event) {
        _event.preventDefault();
        Setup.keyPressed[_event.keyCode] = (_event.type == "keydown");
    }
    /** Maps mouse events to mouseX, mouseY and mousePress */
    static updateMouse(_event) {
        _event.preventDefault();
        var rect = crc2.canvas.getBoundingClientRect();
        Setup.pointerX = _event.clientX - rect.left;
        Setup.pointerY = _event.clientY - rect.top;
        if (_event.type == "mousedown")
            Setup.pointerPress = _event.button + 1;
        if (_event.type == "mouseup")
            Setup.pointerPress = 0;
    }
    /** Maps touch events to mouseX, mouseY and mousePress */
    static updateMouseByTouch(_event) {
        _event.preventDefault();
        Setup.pointerPress = _event.touches.length;
        if (_event.touches.length == 0)
            return;
        var rect = crc2.canvas.getBoundingClientRect();
        Setup.pointerX = _event.touches[0].pageX - rect.left;
        Setup.pointerY = _event.touches[0].pageY - rect.top;
    }
    /** Returns true if the requested key is currently pressed on the keyboard */
    static getKeyPressed(_keyCode) {
        return this.keyPressed[_keyCode] == true;
    }
    /** Initializes the painter-object with the given size */
    static size(_width, _height) {
        crc2.canvas.width = _width;
        crc2.canvas.height = _height;
        crc2.save();
        crc2.fillStyle = "#a0a0a0";
        crc2.fillRect(0, 0, _width, _height);
        crc2.restore();
    }
    /** Sets the title of the browsertab */
    static title(_title) {
        document.title = _title;
    }
    /**
     * Calls the function given as _callback
     * after the time given as _milliseconds has passed
     */
    static setTimeout(_callback, _milliseconds) {
        Setup.timeout = window.setTimeout(_callback, _milliseconds);
    }
    /**
     * Clears the timeout so no subsequent callback will happen
     */
    static clearTimeout() {
        window.clearTimeout(Setup.timeout);
        Setup.timeout = -1;
    }
    /**
     * Calls the function given as _listenerfunction
     * when an event of the type _eventtype occurs
     */
    static addEventListener(_eventtype, _listenerfunction) {
        var e = this.getEventTypeString(_eventtype);
        if (this.listener[e])
            window.removeEventListener(e, this.listener[e]);
        this.listener[e] = function (_event) {
            _event.preventDefault();
            _listenerfunction.call(null, _event);
        };
        window.addEventListener(e, this.listener[e]);
    }
    /**
     * Stops the propagation of the event to the handlers of Setup
     * thus enabling standard behaviour of html-elements
     */
    static stopPropagation(_event) {
        _event.stopPropagation();
    }
    /**
     * Prints the links to the source-files below canvas on load
     */
    static printLinks(_event) {
        var scriptTags = document.getElementsByTagName("script");
        var names = new Array();
        var spacer = " | ";
        var div = document.createElement("div");
        document.body.appendChild(div);
        // create names of ts-files from js-filenames
        for (var i = 0; i < scriptTags.length; i++) {
            names[i] = scriptTags[i].getAttribute("src").replace(".js", ".ts");
        }
        // create to the single files
        for (i = 0; i < names.length; i++) {
            if (i)
                div.appendChild(document.createTextNode(spacer));
            var link = document.createElement("a");
            link.href = names[i];
            link.target = "_blank";
            link.innerHTML = names[i];
            /*/
            link.addEventListener("click", function(_event: Event) {
                _event.preventDefault();
                var w = window.open((<HTMLAnchorElement>_event.target).href);
                w.addEventListener("load", function(_event: Event) {
                    var body: HTMLElement = (<HTMLDocument>_event.target).body;
                    body.innerHTML = "<pre>" + body.textContent + "</pre>";
                });
            });
            //*/
            div.appendChild(link);
        }
        // create link to the parent folder 
        div.appendChild(document.createElement("br"));
        link = document.createElement("a");
        link.href = ".";
        link.innerHTML = "Webspace";
        div.appendChild(link);
        div.appendChild(document.createTextNode(spacer));
        // download link
        link = document.createElement("a");
        link.href = "";
        link.innerHTML = "Download all";
        div.appendChild(link);
        link.addEventListener("click", function (_event) {
            for (var i = 0; i < names.length; i++) {
                _event.preventDefault();
                var link = document.createElement("a");
                link.href = names[i];
                link.setAttribute("download", names[i]);
                div.appendChild(link);
                link.click();
            }
        });
    }
}
/** Current horizontal mouse or touch position */
Setup.pointerX = 0;
/** Current vertical mouse or touch position */
Setup.pointerY = 0;
/** Number of touches or mouse button currently pressed
    (0=None, 1=Left, 2=Middle, 3=Right) */
Setup.pointerPress = 0;
Setup.listener = {};
Setup.keyPressed = {};
Setup.timeout = -1;
Setup.init();
//# sourceMappingURL=Setup.js.map