"use strict";
/// <reference types="../../../../Core/Build/FudgeCore"/>
var Script;
/// <reference types="../../../../Core/Build/FudgeCore"/>
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        let fpsSpan = document.getElementById("fps");
        let lastUpdateTime = 0;
        const updateInterval = 200;
        function update(_event) {
            if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
                fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
                lastUpdateTime = ƒ.Loop.timeFrameStartReal;
            }
            // ƒ.Physics.simulate();  // if physics is included and used
            viewport.draw();
            ƒ.AudioManager.default.update();
        }
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map