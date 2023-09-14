/// <reference types="../../../../Core/Build/FudgeCore"/>
namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a

    let fpsSpan: HTMLSpanElement = document.getElementById("fps") as HTMLElement;
    let lastUpdateTime: number = 0;
    const updateInterval: number = 200;

    function update(_event: Event): void {
      if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
        fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
        lastUpdateTime = ƒ.Loop.timeFrameStartReal;
      }
      // ƒ.Physics.simulate();  // if physics is included and used
      viewport.draw();
      ƒ.AudioManager.default.update();
    }
  }
}