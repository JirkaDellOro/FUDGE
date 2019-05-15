namespace TestDebug {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        let test: Object = { n: 10, t: "Text", b: true, o: {} };
        // console.info("Object: ", test);
        ƒ.Debug.info(test);
        ƒ.Debug.setFilter(ƒ.DebugAlert, ƒ.DEBUG_FILTER.INFO);
        ƒ.Debug.info(test);
        ƒ.Debug.info(test, test);
        // ƒ.Debug.warn(test, test);
        ƒ.Debug.setFilter(ƒ.DebugAlert, ƒ.DEBUG_FILTER.NONE);
        ƒ.Debug.info(test);
        // ƒ.Debug.log("Hallo", test);
        // ƒ.Debug.warn("Hallo", test);
        // ƒ.Debug.error("Hallo", tests);
    }
}
