var Iterator;
(function (Iterator) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let axis = new ƒ.Axis(1, 1 /* INTEGRAL */);
    function init(_event) {
        console.log(axis);
        document.addEventListener("keydown", hndKey);
        document.addEventListener("keyup", hndKey);
        document.addEventListener("mousemove", hndMouseMove);
        update();
    }
    function hndKey(_event) {
        if (_event.repeat)
            return;
        axis.setInput(_event.type == "keydown" ? 1 : 0);
    }
    function hndMouseMove(_event) {
        axis.setInput((_event.clientY - 100) * 0.1);
    }
    function update() {
        console.log(axis.getValue());
        window.setTimeout(update, 20);
    }
})(Iterator || (Iterator = {}));
//# sourceMappingURL=Input.js.map