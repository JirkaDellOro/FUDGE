declare namespace Fudge {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class Vector2 {
        private data;
        constructor(_x?: number, _y?: number);
        x: number;
        y: number;
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static readonly ZERO: Vector2;
        /**
         * A shorthand for writing `new Vector2(0, 1)`.
         * @returns A new vector with the values (0, 1)
         */
        static readonly UP: Vector2;
        /**
         * A shorthand for writing `new Vector2(0, -1)`.
         * @returns A new vector with the values (0, -1)
         */
        static readonly DOWN: Vector2;
        /**
         * A shorthand for writing `new Vector2(1, 0)`.
         * @returns A new vector with the values (1, 0)
         */
        static readonly RIGHT: Vector2;
        /**
         * A shorthand for writing `new Vector2(-1, 0)`.
         * @returns A new vector with the values (-1, 0)
         */
        static readonly LEFT: Vector2;
        /**
         * Scales a given vector by a given scale
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static NORMALIZATION(_vector: Vector2, _length?: number): Vector2;
        /**
         * Scales a given vector by a given scale
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static SCALE(_vector: Vector2, _scale: number): Vector2;
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors: Vector2[]): Vector2;
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a: Vector2, _b: Vector2): Vector2;
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a: Vector2, _b: Vector2): number;
        /**
         * Returns the magnitude of a given vector.
         * If you only need to compare magnitudes of different vectors, you can compare squared magnitudes using Vector2.MAGNITUDESQR instead.
         * @see Vector2.MAGNITUDESQR
         * @param _vector The vector to get the magnitude of.
         * @returns A number representing the magnitude of the given vector.
         */
        static MAGNITUDE(_vector: Vector2): number;
        /**
         * Returns the squared magnitude of a given vector. Much less calculation intensive than Vector2.MAGNITUDE, should be used instead if possible.
         * @param _vector The vector to get the squared magnitude of.
         * @returns A number representing the squared magnitude of the given vector.
         */
        static MAGNITUDESQR(_vector: Vector2): number;
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSSPRODUCT(_a: Vector2, _b: Vector2): number;
        /**
         * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
         * ```plaintext
         *    ^                |
         *    |  =>  <--  =>   v  =>  -->
         * ```
         * @param _vector Vector to get the orthogonal equivalent of
         * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
         * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.
         */
        static ORTHOGONAL(_vector: Vector2, _clockwise?: boolean): Vector2;
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend: Vector2): void;
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend: Vector2): void;
        /**
         * Scales the Vector by the _scale.
         * @param _scale The scale to multiply the vector with.
         */
        scale(_scale: number): void;
        /**
         * Normalizes the vector.
         * @param _length A modificator to get a different length of normalized vector.
         */
        normalize(_length?: number): void;
        /**
         * Sets the Vector to the given parameters. Ommitted parameters default to 0.
         * @param _x new x to set
         * @param _y new y to set
         */
        set(_x?: number, _y?: number): void;
        /**
         * Checks whether the given Vector is equal to the executed Vector.
         * @param _vector The vector to comapre with.
         * @returns true if the two vectors are equal, otherwise false
         */
        equals(_vector: Vector2): boolean;
        /**
         * @returns An array of the data of the vector
         */
        get(): Float32Array;
        /**
         * @returns An deep copy of the vector.
         */
        readonly copy: Vector2;
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * The main Sketch that holds all info related to a whole sketch.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class Sketch {
            objects: SketchObject[];
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * The basic Sketch Object that all drawable objects are made of.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchObject {
            order: number;
            color: string | CanvasGradient | CanvasPattern;
            name: string;
            path2D: Path2D;
            selected: boolean;
            static sort(_a: SketchObject, _b: SketchObject): number;
            draw(_crc: CanvasRenderingContext2D): void;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * The basic path object. Currently the thing that makes up all visual sketch objects
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchPath extends SketchObject {
            closed: boolean;
            vertices: SketchVertex[];
            lineColor: string | CanvasGradient | CanvasPattern;
            lineWidth: number;
            constructor(_color: string | CanvasGradient | CanvasPattern, _lineColor: string | CanvasGradient | CanvasPattern, _lineWidth?: number, _name?: string, _order?: number, _vertices?: SketchVertex[]);
            /**
             * (Re-)Generates the Path2D component of a point.
             */
            generatePath2D(): void;
            /**
             * Draws the path onto the given context.
             * @param _context The context on which to draw the path on.
             */
            draw(_context: CanvasRenderingContext2D): void;
            /**
             * Adds the given vertex to the path.
             * @param _vertex The vertex to add.
             * @param _index The zero-based index at which to insert the vertex. Can be negative to indicate counting from the back. Defaults to -1.
             */
            addVertexAtPos(_vertex: SketchVertex, _index?: number): void;
            /**
             * Moves the whole path object in the given direction.
             * @param _delta The change in position.
             */
            move(_delta: Vector2): void;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * Base class for single points in the Editor.
         * Visually represented by a circle by default.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchPoint extends Fudge.Vector2 {
            selected: boolean;
            protected path2D: Path2D;
            /**
             * Draws the point on the given context at its position.
             * @param _context The rendering context to draw on
             * @param _selected Whether the point is currently selected. Fills the point if it is.
             */
            draw(_context: CanvasRenderingContext2D): void;
            /**
             * (Re-)Generates the Path2D component of a point.
             * It describes a circle.
             * @param _radius Sets the radius to use. Defaults to 5.
             */
            generatePath2D(_radius?: number): Path2D;
            /**
             * Moves the point by the given value.
             * @param _delta the vector that desribes the difference in position
             */
            move(_delta: Vector2): void;
            /**
             * Moves the point to the given position.
             * @param _newPos the vector that describes the new position the point should be moved to.
             */
            moveTo(_newPos: Vector2): void;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * Describes the Tangent Point used to draw the Bezier Curve between two SketchVertices.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchTangentPoint extends SketchPoint {
            parent: SketchVertex;
            /**
             * (Re-)Generates the Path2D component of a point.
             * It describes a square.
             * @param _sideLength Sets the side length to use. Defaults to 10.
             */
            generatePath2D(_sideLength?: number): Path2D;
        }
    }
}
declare namespace Fudge {
    namespace SketchTypes {
        /**
         * Describes the corners of a SketchPath object.
         * @authors Lukas Scheuerle, HFU, 2019
         */
        class SketchVertex extends SketchPoint {
            tangentIn: SketchTangentPoint;
            tangentOut: SketchTangentPoint;
            private activated;
            constructor(_x: number, _y: number, _parent?: SketchPath);
            /**
             * Activates the Vertex to add tangent points to allow for line manipulation.
             */
            activate(): void;
            /**
             * Deactivates the Vertex and removes the tangent points.
             */
            deactivate(): void;
            /**
             * Draws the Vertex.
             * @param _context The context to draw on
             */
            draw(_context: CanvasRenderingContext2D): void;
            /**
             * Moves the vertex by the given Value
             * @param _delta The change in position
             * @param _withTangent Whether the tangent points should be moved in the same way. Defaults to true.
             */
            move(_delta: Vector2, _withTangent?: boolean): void;
        }
    }
}
declare namespace FUDGE {
    class UIButton extends HTMLButtonElement implements UIElement {
        hover: string;
        help: string;
        extendedHelp: string;
        functionToCall: EventListener;
        icon: string;
        constructor(_functionToCall: Function, _name: string, _icon: string, _hover: string, _help: string, _extendedHelp: string);
    }
}
declare namespace FUDGE {
    interface UIElement {
        name: string;
        hover: string;
        help: string;
        extendedHelp: string;
    }
}
declare namespace Fudge {
    namespace Utils {
        function RandomRange(_min: number, _max: number): number;
        function RandomColor(_includeAlpha?: boolean): string;
        function getCircularReplacer(): any;
    }
}
declare namespace Fudge {
    namespace VectorEditor {
        class Editor {
            static pressedKeys: string[];
            sketch: SketchTypes.Sketch;
            selectedTool: Tool;
            canvas: HTMLCanvasElement;
            crc: CanvasRenderingContext2D;
            uiHandler: UIHandler;
            toolManager: ToolManager;
            transformationPoint: Vector2;
            selectedPaths: SketchTypes.SketchPath[];
            selectedPoints: SketchTypes.SketchPoint[];
            scale: number;
            showTangentsShortcut: Shortcut;
            quadraticShapesShortcut: Shortcut;
            tangentsActive: boolean;
            changeHistory: string[];
            changeHistoryIndex: number;
            constructor(_sketch?: SketchTypes.Sketch);
            static isKeyPressed(_key: KEY): boolean;
            static isShortcutPressed(_shortcut: Shortcut): boolean;
            mousedown: (_event: MouseEvent) => void;
            mouseup: (_event: MouseEvent) => void;
            mousemove: (_event: MouseEvent) => void;
            scroll: (_event: WheelEvent) => void;
            setScale(_scale: number, _event?: MouseEvent): void;
            keydown: (_event: KeyboardEvent) => void;
            keyup: (_event: KeyboardEvent) => void;
            selectTool(_name: string): void;
            undo(): void;
            redo(): void;
            saveToChangeHistory(): void;
            private redrawAll;
        }
        let vectorEditor: Editor;
    }
}
declare namespace Fudge {
    namespace VectorEditor {
        interface Shortcut {
            keys: KEY[];
        }
    }
    enum KEY {
        A = "KeyA",
        B = "KeyB",
        C = "KeyC",
        D = "KeyD",
        E = "KeyE",
        F = "KeyF",
        G = "KeyG",
        H = "KeyH",
        I = "KeyI",
        J = "KeyJ",
        K = "KeyK",
        L = "KeyL",
        M = "KeyM",
        N = "KeyN",
        O = "KeyO",
        P = "KeyP",
        Q = "KeyQ",
        R = "KeyR",
        S = "KeyS",
        T = "KeyT",
        U = "KeyU",
        V = "KeyV",
        W = "KeyW",
        X = "KeyX",
        Y = "KeyY",
        Z = "KeyZ",
        ESC = "Escape",
        ZERO = "Digit0",
        ONE = "Digit1",
        TWO = "Digit2",
        TRHEE = "Digit3",
        FOUR = "Digit4",
        FIVE = "Digit5",
        SIX = "Digit6",
        SEVEN = "Digit7",
        EIGHT = "Digit8",
        NINE = "Digit9",
        MINUS = "Minus",
        EQUAL = "Equal",
        BACKSPACE = "Backspace",
        TABULATOR = "Tab",
        BRACKET_LEFT = "BracketLeft",
        BRACKET_RIGHT = "BracketRight",
        ENTER = "Enter",
        CTRL_LEFT = "ControlLeft",
        SEMICOLON = "Semicolon",
        QUOTE = "Quote",
        BACK_QUOTE = "Backquote",
        SHIFT_LEFT = "ShiftLeft",
        BACKSLASH = "Backslash",
        COMMA = "Comma",
        PERIOD = "Period",
        SLASH = "Slash",
        SHIFT_RIGHT = "ShiftRight",
        NUMPAD_MULTIPLY = "NumpadMultiply",
        ALT_LEFT = "AltLeft",
        SPACE = "Space",
        CAPS_LOCK = "CapsLock",
        F1 = "F1",
        F2 = "F2",
        F3 = "F3",
        F4 = "F4",
        F5 = "F5",
        F6 = "F6",
        F7 = "F7",
        F8 = "F8",
        F9 = "F9",
        F10 = "F10",
        PAUSE = "Pause",
        SCROLL_LOCK = "ScrollLock",
        NUMPAD7 = "Numpad7",
        NUMPAD8 = "Numpad8",
        NUMPAD9 = "Numpad9",
        NUMPAD_SUBTRACT = "NumpadSubtract",
        NUMPAD4 = "Numpad4",
        NUMPAD5 = "Numpad5",
        NUMPAD6 = "Numpad6",
        NUMPAD_ADD = "NumpadAdd",
        NUMPAD1 = "Numpad1",
        NUMPAD2 = "Numpad2",
        NUMPAD3 = "Numpad3",
        NUMPAD0 = "Numpad0",
        NUMPAD_DECIMAL = "NumpadDecimal",
        PRINT_SCREEN = "PrintScreen",
        INTL_BACK_SLASH = "IntlBackSlash",
        F11 = "F11",
        F12 = "F12",
        NUMPAD_EQUAL = "NumpadEqual",
        F13 = "F13",
        F14 = "F14",
        F15 = "F15",
        F16 = "F16",
        F17 = "F17",
        F18 = "F18",
        F19 = "F19",
        F20 = "F20",
        F21 = "F21",
        F22 = "F22",
        F23 = "F23",
        F24 = "F24",
        KANA_MODE = "KanaMode",
        LANG2 = "Lang2",
        LANG1 = "Lang1",
        INTL_RO = "IntlRo",
        CONVERT = "Convert",
        NON_CONVERT = "NonConvert",
        INTL_YEN = "IntlYen",
        NUMPAD_COMMA = "NumpadComma",
        UNDO = "Undo",
        PASTE = "Paste",
        MEDIA_TRACK_PREVIOUS = "MediaTrackPrevious",
        CUT = "Cut",
        COPY = "Copy",
        MEDIA_TRACK_NEXT = "MediaTrackNext",
        NUMPAD_ENTER = "NumpadEnter",
        CTRL_RIGHT = "ControlRight",
        AUDIO_VOLUME_MUTE = "AudioVolumeMute",
        LAUNCH_APP2 = "LaunchApp2",
        MEDIA_PLAY_PAUSE = "MediaPlayPause",
        MEDIA_STOP = "MediaStop",
        EJECT = "Eject",
        AUDIO_VOLUME_DOWN = "AudioVolumeDown",
        VOLUME_DOWN = "VolumeDown",
        AUDIO_VOLUME_UP = "AudioVolumeUp",
        VOLUME_UP = "VolumeUp",
        BROWSER_HOME = "BrowserHome",
        NUMPAD_DIVIDE = "NumpadDivide",
        ALT_RIGHT = "AltRight",
        HELP = "Help",
        NUM_LOCK = "NumLock",
        HOME = "Home",
        ARROW_UP = "ArrowUp",
        PAGE_UP = "PageUp",
        ARROW_RIGHT = "ArrowRight",
        END = "End",
        ARROW_DOWN = "ArrowDown",
        PAGE_DOWN = "PageDown",
        INSERT = "Insert",
        DELETE = "Delete",
        META_LEFT = "Meta_Left",
        OS_LEFT = "OSLeft",
        META_RIGHT = "MetaRight",
        OS_RIGHT = "OSRight",
        CONTEXT_MENU = "ContextMenu",
        POWER = "Power",
        BROWSER_SEARCH = "BrowserSearch",
        BROWSER_FAVORITES = "BrowserFavorites",
        BROWSER_REFRESH = "BrowserRefresh",
        BROWSER_STOP = "BrowserStop",
        BROWSER_FORWARD = "BrowserForward",
        BROWSER_BACK = "BrowserBack",
        LAUNCH_APP1 = "LaunchApp1",
        LAUNCH_MAIL = "LaunchMail",
        LAUNCH_MEDIA_PLAYER = "LaunchMediaPlayer",
        FN = "Fn",
        AGAIN = "Again",
        PROPS = "Props",
        SELECT = "Select",
        OPEN = "Open",
        FIND = "Find",
        WAKE_UP = "WakeUp",
        NUMPAD_PARENT_LEFT = "NumpadParentLeft",
        NUMPAD_PARENT_RIGHT = "NumpadParentRight",
        SLEEP = "Sleep"
    }
    function stringToKey(_s: string): KEY;
}
declare namespace Fudge {
    namespace VectorEditor {
        class UIHandler {
            editor: Editor;
            toolBar: HTMLDivElement;
            subToolBar: HTMLDivElement;
            inspector: HTMLDivElement;
            infoBar: HTMLDivElement;
            mousePositionSpan: HTMLSpanElement;
            scaleInput: HTMLInputElement;
            constructor(_editor: Editor);
            updateUI(): void;
            createUI(): void;
            deselectAll(): void;
            updateMousePosition(_x?: number, _y?: number): void;
            updateScale(_scale?: number): void;
            setScale: () => void;
            updateSelectedObjectUI(): void;
            updateSelectedObject(): void;
            handleClickOnTool: (_event: MouseEvent) => void;
        }
    }
}
declare namespace Fudge {
    namespace VectorEditor {
        class Tool {
            static iRegister: number;
            subMenu: FUDGE.UIElement;
            shortcut: Shortcut;
            selectedSubTool: Tool;
            subTools: Tool[];
            name: string;
            icon: string;
            constructor(_name: string);
            mousedown(_event: MouseEvent): void;
            mousemove(_event: MouseEvent): void;
            mouseup(_event: MouseEvent): void;
            mousescroll(_event: MouseEvent): void;
            prequisitesFulfilled(): boolean;
            additionalDisplay(_crc: CanvasRenderingContext2D): void;
            addAdditonalSubmenuOptions(): void;
            exit(): void;
        }
    }
}
declare namespace Fudge {
    namespace VectorEditor {
        class ToolManager {
            static toolTypes: typeof Tool[];
            tools: Tool[];
            constructor();
            static registerTool(_tool: typeof Tool): number;
        }
    }
}
declare namespace Fudge {
    namespace VectorEditor {
        class ToolMove extends Tool {
            static iRegister: number;
            previousPosition: Vector2;
            constructor();
        }
    }
}
declare namespace Fudge {
    namespace VectorEditor {
        class ToolSelect extends Tool {
            static iRegister: number;
            boxSelect: boolean;
            multiSelectShortcut: Shortcut;
            startPosition: Vector2;
            currenPosition: Vector2;
            constructor();
        }
    }
}
