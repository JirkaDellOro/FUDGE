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
        constructor(x, y = 0) {
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
    }
    Utils.Vector2 = Vector2;
})(Utils || (Utils = {}));
//# sourceMappingURL=utils.js.map