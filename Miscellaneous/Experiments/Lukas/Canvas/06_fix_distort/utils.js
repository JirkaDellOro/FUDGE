var Utils;
(function (Utils) {
    function RandomRange(min, max) {
        return Math.floor((Math.random() * (max + min)) - min);
    }
    Utils.RandomRange = RandomRange;
    function RandomColor(includeAlpha = false) {
        let c = "rgba(";
        c += RandomRange(0, 255) + ",";
        c += RandomRange(0, 255) + ",";
        c += RandomRange(0, 255) + ",";
        c += includeAlpha ? RandomRange(0, 255) + ")" : "1)";
        return c;
    }
    Utils.RandomColor = RandomColor;
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        equals(obj) {
            if (this.x != obj.x)
                return false;
            if (this.y != obj.y)
                return false;
            return true;
        }
        magnitude() {
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        }
        sqrMagnitude() {
            return Math.pow(this.x, 2) + Math.pow(this.y, 2);
        }
        static dot(a, b) {
            return a.x * b.x + a.y * b.y;
        }
        normalize() {
            return new Vector2(this.x / this.magnitude(), this.y / this.magnitude());
        }
        perpendicularVector() {
            let v = this.normalize();
            return new Vector2(v.y, -v.x);
        }
    }
    Utils.Vector2 = Vector2;
    let KEYCODE;
    (function (KEYCODE) {
        KEYCODE[KEYCODE["CANCEL"] = 3] = "CANCEL";
        KEYCODE[KEYCODE["HELP"] = 6] = "HELP";
        KEYCODE[KEYCODE["BACK_SPACE"] = 8] = "BACK_SPACE";
        KEYCODE[KEYCODE["TAB"] = 9] = "TAB";
        KEYCODE[KEYCODE["CLEAR"] = 12] = "CLEAR";
        KEYCODE[KEYCODE["RETURN"] = 13] = "RETURN";
        KEYCODE[KEYCODE["ENTER"] = 14] = "ENTER";
        KEYCODE[KEYCODE["SHIFT"] = 16] = "SHIFT";
        KEYCODE[KEYCODE["CONTROL"] = 17] = "CONTROL";
        KEYCODE[KEYCODE["ALT"] = 18] = "ALT";
        KEYCODE[KEYCODE["PAUSE"] = 19] = "PAUSE";
        KEYCODE[KEYCODE["CAPS_LOCK"] = 20] = "CAPS_LOCK";
        KEYCODE[KEYCODE["ESCAPE"] = 27] = "ESCAPE";
        KEYCODE[KEYCODE["SPACE"] = 32] = "SPACE";
        KEYCODE[KEYCODE["PAGE_UP"] = 33] = "PAGE_UP";
        KEYCODE[KEYCODE["PAGE_DOWN"] = 34] = "PAGE_DOWN";
        KEYCODE[KEYCODE["END"] = 35] = "END";
        KEYCODE[KEYCODE["HOME"] = 36] = "HOME";
        KEYCODE[KEYCODE["LEFT"] = 37] = "LEFT";
        KEYCODE[KEYCODE["UP"] = 38] = "UP";
        KEYCODE[KEYCODE["RIGHT"] = 39] = "RIGHT";
        KEYCODE[KEYCODE["DOWN"] = 40] = "DOWN";
        KEYCODE[KEYCODE["PRINTSCREEN"] = 44] = "PRINTSCREEN";
        KEYCODE[KEYCODE["INSERT"] = 45] = "INSERT";
        KEYCODE[KEYCODE["DELETE"] = 46] = "DELETE";
        KEYCODE[KEYCODE["NUM0"] = 48] = "NUM0";
        KEYCODE[KEYCODE["NUM1"] = 49] = "NUM1";
        KEYCODE[KEYCODE["NUM2"] = 50] = "NUM2";
        KEYCODE[KEYCODE["NUM3"] = 51] = "NUM3";
        KEYCODE[KEYCODE["NUM4"] = 52] = "NUM4";
        KEYCODE[KEYCODE["NUM5"] = 53] = "NUM5";
        KEYCODE[KEYCODE["NUM6"] = 54] = "NUM6";
        KEYCODE[KEYCODE["NUM7"] = 55] = "NUM7";
        KEYCODE[KEYCODE["NUM8"] = 56] = "NUM8";
        KEYCODE[KEYCODE["NUM9"] = 57] = "NUM9";
        KEYCODE[KEYCODE["SEMICOLON"] = 59] = "SEMICOLON";
        KEYCODE[KEYCODE["EQUALS"] = 61] = "EQUALS";
        KEYCODE[KEYCODE["A"] = 65] = "A";
        KEYCODE[KEYCODE["B"] = 66] = "B";
        KEYCODE[KEYCODE["C"] = 67] = "C";
        KEYCODE[KEYCODE["D"] = 68] = "D";
        KEYCODE[KEYCODE["E"] = 69] = "E";
        KEYCODE[KEYCODE["F"] = 70] = "F";
        KEYCODE[KEYCODE["G"] = 71] = "G";
        KEYCODE[KEYCODE["H"] = 72] = "H";
        KEYCODE[KEYCODE["I"] = 73] = "I";
        KEYCODE[KEYCODE["J"] = 74] = "J";
        KEYCODE[KEYCODE["K"] = 75] = "K";
        KEYCODE[KEYCODE["L"] = 76] = "L";
        KEYCODE[KEYCODE["M"] = 77] = "M";
        KEYCODE[KEYCODE["N"] = 78] = "N";
        KEYCODE[KEYCODE["O"] = 79] = "O";
        KEYCODE[KEYCODE["P"] = 80] = "P";
        KEYCODE[KEYCODE["Q"] = 81] = "Q";
        KEYCODE[KEYCODE["R"] = 82] = "R";
        KEYCODE[KEYCODE["S"] = 83] = "S";
        KEYCODE[KEYCODE["T"] = 84] = "T";
        KEYCODE[KEYCODE["U"] = 85] = "U";
        KEYCODE[KEYCODE["V"] = 86] = "V";
        KEYCODE[KEYCODE["W"] = 87] = "W";
        KEYCODE[KEYCODE["X"] = 88] = "X";
        KEYCODE[KEYCODE["Y"] = 89] = "Y";
        KEYCODE[KEYCODE["Z"] = 90] = "Z";
        KEYCODE[KEYCODE["CONTEXT_MENU"] = 93] = "CONTEXT_MENU";
        KEYCODE[KEYCODE["NUMPAD0"] = 96] = "NUMPAD0";
        KEYCODE[KEYCODE["NUMPAD1"] = 97] = "NUMPAD1";
        KEYCODE[KEYCODE["NUMPAD2"] = 98] = "NUMPAD2";
        KEYCODE[KEYCODE["NUMPAD3"] = 99] = "NUMPAD3";
        KEYCODE[KEYCODE["NUMPAD4"] = 100] = "NUMPAD4";
        KEYCODE[KEYCODE["NUMPAD5"] = 101] = "NUMPAD5";
        KEYCODE[KEYCODE["NUMPAD6"] = 102] = "NUMPAD6";
        KEYCODE[KEYCODE["NUMPAD7"] = 103] = "NUMPAD7";
        KEYCODE[KEYCODE["NUMPAD8"] = 104] = "NUMPAD8";
        KEYCODE[KEYCODE["NUMPAD9"] = 105] = "NUMPAD9";
        KEYCODE[KEYCODE["MULTIPLY"] = 106] = "MULTIPLY";
        KEYCODE[KEYCODE["ADD"] = 107] = "ADD";
        KEYCODE[KEYCODE["SEPARATOR"] = 108] = "SEPARATOR";
        KEYCODE[KEYCODE["SUBTRACT"] = 109] = "SUBTRACT";
        KEYCODE[KEYCODE["DECIMAL"] = 110] = "DECIMAL";
        KEYCODE[KEYCODE["DIVIDE"] = 111] = "DIVIDE";
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
        KEYCODE[KEYCODE["F13"] = 124] = "F13";
        KEYCODE[KEYCODE["F14"] = 125] = "F14";
        KEYCODE[KEYCODE["F15"] = 126] = "F15";
        KEYCODE[KEYCODE["F16"] = 127] = "F16";
        KEYCODE[KEYCODE["F17"] = 128] = "F17";
        KEYCODE[KEYCODE["F18"] = 129] = "F18";
        KEYCODE[KEYCODE["F19"] = 130] = "F19";
        KEYCODE[KEYCODE["F20"] = 131] = "F20";
        KEYCODE[KEYCODE["F21"] = 132] = "F21";
        KEYCODE[KEYCODE["F22"] = 133] = "F22";
        KEYCODE[KEYCODE["F23"] = 134] = "F23";
        KEYCODE[KEYCODE["F24"] = 135] = "F24";
        KEYCODE[KEYCODE["NUM_LOCK"] = 144] = "NUM_LOCK";
        KEYCODE[KEYCODE["SCROLL_LOCK"] = 145] = "SCROLL_LOCK";
        KEYCODE[KEYCODE["COMMA"] = 188] = "COMMA";
        KEYCODE[KEYCODE["PERIOD"] = 190] = "PERIOD";
        KEYCODE[KEYCODE["SLASH"] = 191] = "SLASH";
        KEYCODE[KEYCODE["BACK_QUOTE"] = 192] = "BACK_QUOTE";
        KEYCODE[KEYCODE["OPEN_BRACKET"] = 219] = "OPEN_BRACKET";
        KEYCODE[KEYCODE["BACK_SLASH"] = 220] = "BACK_SLASH";
        KEYCODE[KEYCODE["CLOSE_BRACKET"] = 221] = "CLOSE_BRACKET";
        KEYCODE[KEYCODE["QUOTE"] = 222] = "QUOTE";
        KEYCODE[KEYCODE["META"] = 224] = "META";
    })(KEYCODE = Utils.KEYCODE || (Utils.KEYCODE = {}));
})(Utils || (Utils = {}));
//# sourceMappingURL=utils.js.map