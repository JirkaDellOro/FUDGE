"use strict";
var Maps;
(function (Maps) {
    window.addEventListener("load", init);
    function init() {
        let map = new Map();
        let r1 = { x: 0, y: 0, width: 0, height: 0 };
        let r2 = { x: 1, y: 0, width: 0, height: 0 };
        map.set(r1, "Rect 1");
        map.set(r2, "Rect 2");
        console.log(map.get(r1));
        console.log(map.get(r2));
    }
})(Maps || (Maps = {}));
//# sourceMappingURL=Test.js.map