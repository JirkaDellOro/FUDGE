var EventPassing;
(function (EventPassing) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let test = { n: 10, t: "Text", b: true, o: {} };
        // console.info("Object: ", test);
        ƒ.Debug.info(test);
        ƒ.Debug.setFilter(ƒ.DEBUG_TARGET.ALERT, ƒ.DEBUG_FILTER.INFO);
        ƒ.Debug.info(test);
        ƒ.Debug.setFilter(ƒ.DEBUG_TARGET.ALERT, ƒ.DEBUG_FILTER.NONE);
        ƒ.Debug.info(test);
        // ƒ.Debug.log("Hallo", test);
        // ƒ.Debug.warn("Hallo", test);
        // ƒ.Debug.error("Hallo", tests);
    }
})(EventPassing || (EventPassing = {}));
//# sourceMappingURL=Debug.js.map