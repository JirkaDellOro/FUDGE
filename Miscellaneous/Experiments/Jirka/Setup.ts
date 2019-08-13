/**
 * Class Setup !!
 * Basic functionality for simple creation of a template for the programming course at HFU
 * 
 * @author Prof. Jirka R. Dell'Oro-Friedl
 */

/** The painter-object enables drawing on the 2D-canvas. It's type is CanvasRenderingContext2D*/
var crc2: CanvasRenderingContext2D;

/** Keycodes to use with Setup.getKeyPressed */
enum KEYCODE {
    A = 65, S = 83, D = 68, W = 87, UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39, SPACE = 32, Q = 81, E = 69,
    ALT = 18, CTRL = 17, SHIFT = 16, TAB = 9, ENTER = 13, BACKSPACE = 8, PAGEUP = 33, PAGEDOWN = 34, ESC = 27,
    F1 = 112, F2 = 113, F3 = 114, F4 = 115, F5 = 116, F6 = 117, F7 = 118, F8 = 119, F9 = 120, F10 = 121, F11 = 122, F12 = 123,
    NUMBER_0 = 48, NUMBER_1 = 49, NUMBER_2 = 50, NUMBER_3 = 51, NUMBER_4 = 52, NUMBER_5 = 53, NUMBER_6 = 54, NUMBER_7 = 55, NUMBER_8 = 56, NUMBER_9 = 57
};

/** Eventtypes to use with Setup.addEventListener */
enum EVENTTYPE { MOUSEDOWN, MOUSEUP, MOUSEMOVE, TOUCHSTART, TOUCHEND, TOUCHMOVE, KEYDOWN, KEYUP, LOAD };

interface Listener {
    [event: string]: (_event: Event) => void;
}
interface KeyPressed {
    [key: string]: boolean;
}

class Setup {
    /** Current horizontal mouse or touch position */
    public static pointerX: number = 0;
    /** Current vertical mouse or touch position */
    public static pointerY: number = 0;
    /** Number of touches or mouse button currently pressed
        (0=None, 1=Left, 2=Middle, 3=Right) */
    public static pointerPress: number = 0;
    private static listener: Listener = {};
    private static keyPressed: KeyPressed = {};
    private static timeout: number = -1;

    /** Creates the canvas and sets up tracking for mouse, touch and keys */
    static init(): void {
        document.body.style.margin = "0"; //"{margin=0;padding=0;}"
        var c: HTMLCanvasElement = document.createElement("canvas");
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

    private static getEventTypeString(_eventtype: EVENTTYPE): string {
        var eventString: string = EVENTTYPE[_eventtype].toLowerCase();
        return eventString;
    }

    /** Maintains the array of currenty pressed keys */
    private static trackKeypress(_event: KeyboardEvent): void {
        _event.preventDefault();
        Setup.keyPressed[_event.keyCode] = (_event.type == "keydown");
    }

    /** Maps mouse events to mouseX, mouseY and mousePress */
    private static updateMouse(_event: MouseEvent): void {
        _event.preventDefault();
        var rect: ClientRect = crc2.canvas.getBoundingClientRect();
        Setup.pointerX = _event.clientX - rect.left;
        Setup.pointerY = _event.clientY - rect.top;
        if (_event.type == "mousedown") Setup.pointerPress = _event.button + 1;
        if (_event.type == "mouseup") Setup.pointerPress = 0;
    }

    /** Maps touch events to mouseX, mouseY and mousePress */
    private static updateMouseByTouch(_event: TouchEvent): void {
        _event.preventDefault();
        Setup.pointerPress = _event.touches.length;
        if (_event.touches.length == 0)
            return;
        var rect: ClientRect = crc2.canvas.getBoundingClientRect();
        Setup.pointerX = _event.touches[0].pageX - rect.left;
        Setup.pointerY = _event.touches[0].pageY - rect.top;
    }

    /** Returns true if the requested key is currently pressed on the keyboard */
    public static getKeyPressed(_keyCode: KEYCODE): boolean {
        return this.keyPressed[_keyCode] == true;
    }

    /** Initializes the painter-object with the given size */
    public static size(_width: number, _height: number): void {
        crc2.canvas.width = _width;
        crc2.canvas.height = _height;
        crc2.save();
        crc2.fillStyle = "#a0a0a0";
        crc2.fillRect(0, 0, _width, _height);
        crc2.restore();
    }

    /** Sets the title of the browsertab */
    public static title(_title: string): void {
        document.title = _title;
    }

    /**
     * Calls the function given as _callback
     * after the time given as _milliseconds has passed
     */
    public static setTimeout(_callback: Function, _milliseconds: number): void {
        Setup.timeout = window.setTimeout(_callback, _milliseconds);
    }
    /**
     * Clears the timeout so no subsequent callback will happen
     */
    public static clearTimeout(): void {
        window.clearTimeout(Setup.timeout);
        Setup.timeout = -1;
    }

    /**
     * Calls the function given as _listenerfunction
     * when an event of the type _eventtype occurs
     */
    public static addEventListener(_eventtype: EVENTTYPE, _listenerfunction: Function): void {
        var e: string = this.getEventTypeString(_eventtype);
        if (this.listener[e])
            window.removeEventListener(e, this.listener[e]);

        this.listener[e] = function(_event: Event): void {
            _event.preventDefault();
            _listenerfunction.call(null, _event);
        };

        window.addEventListener(e, this.listener[e]);
    }
    
    /**
     * Stops the propagation of the event to the handlers of Setup
     * thus enabling standard behaviour of html-elements
     */
    public static stopPropagation(_event: Event): void {
        _event.stopPropagation();
    }
    
    /**
     * Prints the links to the source-files below canvas on load 
     */
    private static printLinks(_event: Event): void {
        var scriptTags: NodeListOf<HTMLScriptElement> = document.getElementsByTagName("script");
        var names: string[] = new Array<string>();
        var spacer: string = " | ";
        var div: HTMLDivElement = document.createElement("div");
        document.body.appendChild(div);
        
        // create names of ts-files from js-filenames
        for (var i: number = 0; i < scriptTags.length; i++) {
            names[i] = scriptTags[i].getAttribute("src").replace(".js", ".ts");
        }
        
        // create to the single files
        for (i = 0; i < names.length; i++) {
            if (i) div.appendChild(document.createTextNode(spacer));
            var link: HTMLAnchorElement = document.createElement("a");
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
        link.addEventListener("click", function(_event: Event): void {
            for (var i: number = 0; i < names.length; i++) {
                _event.preventDefault();
                var link: HTMLAnchorElement = document.createElement("a");
                link.href = names[i];
                link.setAttribute("download", names[i]);
                div.appendChild(link);
                link.click();
            }
        });
    }
}


Setup.init();
