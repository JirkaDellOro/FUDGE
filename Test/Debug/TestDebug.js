var TestDebug;
(function (TestDebug) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let test = { n: 10, t: "Text", b: true, o: {} };
        // console.info("Object: ", test);
        ƒ.Debug.info("Info | Console | 1 Object: ", test);
        ƒ.Debug.setFilter(ƒ.DebugAlert, ƒ.DEBUG_FILTER.INFO);
        ƒ.Debug.info("Info | Console+Alert | 1 Object: ", test);
        ƒ.Debug.info("Info | Console+Alert | 2 Objects: ", test, test);
        ƒ.Debug.setFilter(ƒ.DebugAlert, ƒ.DEBUG_FILTER.ALL);
        ƒ.Debug.log("Log |  Console+Alert | 1 Object: ", test);
        ƒ.Debug.warn("Warning |  Console+Alert | 1 Object: ", test);
        ƒ.Debug.error("Error |  Console+Alert | 1 Object: ", test);
        ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.NONE);
        ƒ.Debug.log("Log | Alert | 1 Object: ", test);
        ƒ.Debug.warn("Warning | Alert | 1 Object: ", test);
        ƒ.Debug.error("Error | Alert | 1 Object: ", test);
        ƒ.Debug.setFilter(ƒ.DebugAlert, ƒ.DEBUG_FILTER.NONE);
        ƒ.Debug.log("Log | - | 1 Object: ", test);
        ƒ.Debug.warn("Warning | - | 1 Object: ", test);
        ƒ.Debug.error("Error | - | 1 Object: ", test);
    }
})(TestDebug || (TestDebug = {}));
//# sourceMappingURL=TestDebug.js.map