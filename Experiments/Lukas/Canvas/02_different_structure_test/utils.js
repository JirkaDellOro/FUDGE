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
})(Utils || (Utils = {}));
//# sourceMappingURL=utils.js.map