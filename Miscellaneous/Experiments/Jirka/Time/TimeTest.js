var TimeTest;
(function (TimeTest) {
    window.addEventListener("load", init);
    let time;
    function init(_event) {
        time = new TimeTest.Time();
        testAnimation();
    }
    function testAnimation() {
        let element = createElement();
        document.addEventListener("change", changeValue);
        animate();
        function changeValue(_event) {
            let scaleStepper = (_event.target);
            time.setScale(Number(scaleStepper.value));
        }
        function animate() {
            requestAnimationFrame(animate);
            let x = time.get();
            x = x % window.innerWidth;
            while (x < 0)
                x += window.innerWidth;
            element.style.left = x + "px";
            console.log(time.getElapsedSincePreviousCall());
        }
        function createElement() {
            let span = document.createElement("span");
            document.body.appendChild(span);
            span.style.position = "absolute";
            span.innerText = "X";
            return span;
        }
    }
    function testNumbers() {
        console.group("Normal");
        console.log(time.get());
        console.log(time.get());
        console.log(time.get());
        console.groupEnd();
        console.group("Reset to 100");
        time.set(100);
        console.log(time.get());
        console.log(time.get());
        console.log(time.get());
        console.groupEnd();
        console.group("Scaled to 1000");
        time.setScale(1000);
        console.log(time.get());
        console.log(time.get());
        console.log(time.get());
        console.groupEnd();
        console.group("Scaled to 0.001");
        time.setScale(0.001);
        console.log(time.get());
        console.log(time.get());
        console.log(time.get());
        console.groupEnd();
        console.group("Reset to -1");
        time.set(-1);
        console.log(time.get());
        console.log(time.get());
        console.log(time.get());
        console.groupEnd();
        console.group("Scaled to -1");
        time.setScale(-1);
        console.log(time.get());
        console.log(time.get());
        console.log(time.get());
        console.groupEnd();
    }
})(TimeTest || (TimeTest = {}));
//# sourceMappingURL=TimeTest.js.map