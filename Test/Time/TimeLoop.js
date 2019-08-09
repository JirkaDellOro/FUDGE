var TimeLoop;
(function (TimeLoop) {
    var ƒ = Fudge;
    window.addEventListener("load", handleLoad);
    function handleLoad(_event) {
        console.log("Start");
        document.forms[0].addEventListener("change", handleChange);
        document.querySelector("[name=start]").addEventListener("click", handleButtonClick);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, handleFrame);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 20);
    }
    function handleChange(_event) {
        let formData = new FormData(document.forms[0]);
        for (let entry of formData)
            console.dir(entry);
    }
    function handleButtonClick(_event) {
        console.log("Button");
    }
    function handleFrame(_event) {
        let meter = document.querySelector("[name=frame]");
        meter.value = (meter.value + 1) % 10;
        let avg = document.querySelector("[name=avg]");
        avg.value = ƒ.Loop.getFpsRealAverage().toFixed(2);
    }
})(TimeLoop || (TimeLoop = {}));
//# sourceMappingURL=TimeLoop.js.map