// /<reference path="../Event/Event.ts"/>
// /<reference path="../Time/Time.ts"/>
namespace FudgeCore {
  /**
   * Determines the mode a loop runs in
   */
  export enum LOOP_MODE {
    /** Loop cycles controlled by window.requestAnimationFrame */
    FRAME_REQUEST = "frameRequest",
    /** Loop cycles with the given framerate in {@link Time.game} */
    TIME_GAME = "timeGame",
    /** Loop cycles with the given framerate in realtime, independent of {@link Time.game} */
    TIME_REAL = "timeReal"
  }

  /**
   * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
   * It then fires {@link EVENT.LOOP_FRAME} to all added listeners at each frame
   * 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Loop extends EventTargetStatic {
    private static ƒTimeStartGame: number = 0;
    private static ƒTimeStartReal: number = 0;
    private static ƒTimeFrameGame: number = 0;
    private static ƒTimeFrameReal: number = 0;
    private static ƒTimeFrameStartGame: number = 0;
    private static ƒTimeFrameStartReal: number = 0;
    private static ƒTimeLastFrameGameAvg: number = 0;
    private static ƒTimeLastFrameRealAvg: number = 0;
    private static ƒFrames: number = 0;
    private static running: boolean = false;
    private static mode: LOOP_MODE = LOOP_MODE.FRAME_REQUEST;
    private static idIntervall: number = 0;
    private static idRequest: number = 0;
    private static fpsDesired: number = 30;
    private static framesToAverage: number = 30;
    private static syncWithAnimationFrame: boolean = false;

    /** The gametime the loop was started, overwritten at each start */
    public static get timeStartGame(): number { return Loop.ƒTimeStartGame; }
    /** The realtime the loop was started, overwritten at each start */
    public static get timeStartReal(): number { return Loop.ƒTimeStartReal; }
    /** The gametime elapsed since the last loop cycle */
    public static get timeFrameGame(): number { return Loop.ƒTimeFrameGame; }
    /** The realtime elapsed since the last loop cycle */
    public static get timeFrameReal(): number { return Loop.ƒTimeFrameReal; }
    /** The gametime the last loop cycle started*/
    public static get timeFrameStartGame(): number { return Loop.ƒTimeFrameStartGame; }
    /** The realtime the last loop cycle started*/
    public static get timeFrameStartReal(): number { return Loop.ƒTimeFrameStartReal; }
    /** The average number of frames per second in gametime */
    public static get fpsGameAverage(): number { return 1000 / Loop.ƒTimeLastFrameGameAvg; }
    /** The average number of frames per second in realtime */
    public static get fpsRealAverage(): number { return 1000 / Loop.ƒTimeLastFrameRealAvg; }
    /** The number of frames triggered so far */
    public static get frames(): number { return Loop.ƒFrames; }

    /**
     * Starts the loop with the given mode and fps.  
     * The default for _mode is FRAME_REQUEST, see {@link LOOP_MODE}, hooking the loop to the browser's animation frame.
     * Is only applicable in TIME-modes.
     * _syncWithAnimationFrame is experimental and only applicable in TIME-modes, deferring the loop-cycle until the next possible animation frame.
     */
    public static start(_mode: LOOP_MODE = LOOP_MODE.FRAME_REQUEST, _fps: number = 60, _syncWithAnimationFrame: boolean = false): void {
      Loop.stop();

      Loop.ƒTimeStartGame = Time.game.get();
      Loop.ƒTimeStartReal = performance.now();
      Loop.ƒTimeFrameStartGame = Loop.ƒTimeStartGame;
      Loop.ƒTimeFrameStartReal = Loop.ƒTimeStartReal;
      Loop.fpsDesired = (_mode == LOOP_MODE.FRAME_REQUEST) ? 60 : _fps;
      Loop.framesToAverage = Loop.fpsDesired;
      Loop.ƒTimeLastFrameGameAvg = Loop.ƒTimeLastFrameRealAvg = 1000 / Loop.fpsDesired;
      Loop.mode = _mode;
      Loop.syncWithAnimationFrame = _syncWithAnimationFrame;

      let log: string = `Loop starting in mode ${Loop.mode}`;
      if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
        log += ` with attempted ${_fps} fps`;
      Debug.fudge(log);

      switch (_mode) {
        case LOOP_MODE.FRAME_REQUEST:
          Loop.loopFrame();
          break;
        case LOOP_MODE.TIME_REAL:
          Loop.idIntervall = window.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
          Loop.loopTime();
          break;
        case LOOP_MODE.TIME_GAME:
          Loop.idIntervall = Time.game.setTimer(1000 / Loop.fpsDesired, 0, Loop.loopTime);
          Loop.loopTime();
          break;
        default:
          break;
      }

      Loop.running = true;
    }

    /**
     * Stops the loop
     */
    public static stop(): void {
      if (!Loop.running)
        return;

      switch (Loop.mode) {
        case LOOP_MODE.FRAME_REQUEST:
          window.cancelAnimationFrame(Loop.idRequest);
          break;
        case LOOP_MODE.TIME_REAL:
          window.clearInterval(Loop.idIntervall);
          window.cancelAnimationFrame(Loop.idRequest);
          break;
        case LOOP_MODE.TIME_GAME:
          Time.game.deleteTimer(Loop.idIntervall);
          window.cancelAnimationFrame(Loop.idRequest);
          break;
        default:
          break;
      }

      Loop.running = false;
      Debug.fudge("Loop stopped!");
    }

    public static continue(): void {
      if (Loop.running)
        return;

      Loop.start(Loop.mode, Loop.fpsDesired, Loop.syncWithAnimationFrame);
    }

    private static loop(): void {
      let time: number;
      time = performance.now();
      Loop.ƒTimeFrameReal = time - Loop.ƒTimeFrameStartReal;
      Loop.ƒTimeFrameStartReal = time;

      time = Time.game.get();
      Loop.ƒTimeFrameGame = time - Loop.ƒTimeFrameStartGame;
      Loop.ƒTimeFrameStartGame = time;

      Loop.ƒTimeLastFrameGameAvg = ((Loop.framesToAverage - 1) * Loop.ƒTimeLastFrameGameAvg + Loop.ƒTimeFrameGame) / Loop.framesToAverage;
      Loop.ƒTimeLastFrameRealAvg = ((Loop.framesToAverage - 1) * Loop.ƒTimeLastFrameRealAvg + Loop.ƒTimeFrameReal) / Loop.framesToAverage;

      // TODO: consider LoopEvent which conveys information such as timeElapsed etc...
      Loop.ƒFrames++;
      let event: Event = new Event(EVENT.LOOP_FRAME);
      Loop.targetStatic.dispatchEvent(event);
    }

    private static loopFrame(): void {
      Loop.loop();
      Loop.idRequest = window.requestAnimationFrame(Loop.loopFrame);
    }

    private static loopTime(): void {
      if (Loop.syncWithAnimationFrame)
        Loop.idRequest = window.requestAnimationFrame(Loop.loop);
      else
        Loop.loop();
    }
  }

}