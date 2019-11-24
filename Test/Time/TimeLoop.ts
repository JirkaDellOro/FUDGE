namespace TimeLoop {
    import ƒ = FudgeCore;
    window.addEventListener("load", handleLoad);

    function handleLoad(_event: Event): void {
        console.log("Start");
        document.forms[0].addEventListener("change", handleChangeLoop);
        document.forms[1].addEventListener("change", handleChangeTime);
        document.querySelector("[name=start]").addEventListener("click", handleButtonClick);
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, handleFrame);
        loop();
        handleChangeLoop(null);
    }

    function handleChangeLoop(_event: Event): void {
        let formData: FormData = new FormData(document.forms[0]);
        let mode: string = String(formData.get("mode"));
        let fps: number = Number(formData.get("fps"));

        ƒ.Loop.start(ƒ.LOOP_MODE[mode], fps, true);

        let fpsInput: HTMLInputElement = (<HTMLInputElement>document.querySelector("input[name=fps]"));
        fpsInput.readOnly = (mode == "FRAME_REQUEST");
    }

    function handleChangeTime(_event: Event): void {
        let formData: FormData = new FormData(<HTMLFormElement>_event.currentTarget);
        let scale: number = Number(formData.get("scale"));
        ƒ.Time.game.setScale(scale);
        console.log("Scale set to: " + scale);
    }

    function handleButtonClick(_event: Event): void {
        let lapse: number = Number((<HTMLInputElement>document.querySelector("input[name=lapse]")).value);
        console.log("Timeout set to: " + lapse);
        ƒ.Time.game.setTimer(lapse, 1, handleTimeout);
    }
    function handleTimeout(): void {
        let meter: HTMLMeterElement = document.querySelector("[name=event]");
        meter.value = 1 + meter.value % 10;
    }
    function handleFrame(_event: Event): void {
        let meter: HTMLMeterElement = document.querySelector("[name=frame]");
        meter.value = 1 + meter.value % 10;

        let avg: HTMLInputElement = document.querySelector("[name=avg]");
        avg.value = ƒ.Loop.getFpsRealAverage().toFixed(1);
    }

    function loop(): void {
        let time: HTMLInputElement = document.querySelector("[name=time]");
        let date: Date = new Date(ƒ.Time.game.get());
        // time.value = ƒ.Time.game.get().toPrecision();
        time.value =
            String(date.getMinutes()).padStart(2, "0") + ":" +
            String(date.getSeconds()).padStart(2, "0") + ":" +
            String(date.getMilliseconds()).padStart(3, "0");

        window.requestAnimationFrame(loop);
    }
}