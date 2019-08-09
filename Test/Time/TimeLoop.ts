namespace TimeLoop {
    import ƒ = Fudge;
    window.addEventListener("load", handleLoad);

    function handleLoad(_event: Event): void {
        console.log("Start");
        document.forms[0].addEventListener("change", handleChange);
        document.querySelector("[name=start]").addEventListener("click", handleButtonClick);
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, handleFrame);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 20);
    }

    function handleChange(_event: Event): void {
        let formData: FormData = new FormData(document.forms[0]);
        for (let entry of formData)
            console.dir(entry);
    }

    function handleButtonClick(_event: Event): void {
        console.log("Button");
    }

    function handleFrame(_event: Event): void {
        let meter: HTMLMeterElement = document.querySelector("[name=frame]");
        meter.value = (meter.value + 1) % 10;

        let avg: HTMLInputElement = document.querySelector("[name=avg]");
        avg.value = ƒ.Loop.getFpsRealAverage().toFixed(2);
    }
}