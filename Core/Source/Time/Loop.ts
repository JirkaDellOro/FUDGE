///<reference path="../Event/Event.ts"/>
///<reference path="../Time/Time.ts"/>
namespace FudgeCore {
  /**
   * Determines the mode a loop runs in
   */
  export enum LOOP_MODE {
    /** Loop cycles controlled by window.requestAnimationFrame */
    FRAME_REQUEST = "frameRequest",
    /** Loop cycles with the given framerate in [[Time]].game */
    TIME_GAME = "timeGame",
    /** Loop cycles with the given framerate in realtime, independent of [[Time]].game */
    TIME_REAL = "timeReal"
  }

  /**
   * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
   * It then fires [[EVENT]].LOOP\_FRAME to all added listeners at each frame
   * 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Loop extends EventTargetStatic {
    /** The gametime the loop was started, overwritten at each start */
    public static timeStartGame: number = 0;
    /** The realtime the loop was started, overwritten at each start */
    public static timeStartReal: number = 0;
    /** The gametime elapsed since the last loop cycle */
    public static timeFrameGame: number = 0;
    /** The realtime elapsed since the last loop cycle */
    public static timeFrameReal: number = 0;

    private static timeLastFrameGame: number = 0;
    private static timeLastFrameReal: number = 0;
    private static timeLastFrameGameAvg: number = 0;
    private static timeLastFrameRealAvg: number = 0;
    private static running: boolean = false;
    private static mode: LOOP_MODE = LOOP_MODE.FRAME_REQUEST;
    private static idIntervall: number = 0;
    private static idRequest: number = 0;
    private static fpsDesired: number = 30;
    private static framesToAverage: number = 30;
    private static syncWithAnimationFrame: boolean = false;

    /**
     * Starts the loop with the given mode and fps
     * @param _mode 
     * @param _fps Is only applicable in TIME-modes
     * @param _syncWithAnimationFrame Experimental and only applicable in TIME-modes. Should defer the loop-cycle until the next possible animation frame.
     */
    public static start(_mode: LOOP_MODE = LOOP_MODE.FRAME_REQUEST, _fps: number = 60, _syncWithAnimationFrame: boolean = false): void {
      Loop.stop();

      Loop.timeStartGame = Time.game.get();
      Loop.timeStartReal = performance.now();
      Loop.timeLastFrameGame = Loop.timeStartGame;
      Loop.timeLastFrameReal = Loop.timeStartReal;
      Loop.fpsDesired = (_mode == LOOP_MODE.FRAME_REQUEST) ? 60 : _fps;
      Loop.framesToAverage = Loop.fpsDesired;
      Loop.timeLastFrameGameAvg = Loop.timeLastFrameRealAvg = 1000 / Loop.fpsDesired;
      Loop.mode = _mode;
      Loop.syncWithAnimationFrame = _syncWithAnimationFrame;

      let log: string = `Loop starting in mode ${Loop.mode}`;
      if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
        log += ` with attempted ${_fps} fps`;
      Debug.log(log);

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

      Debug.log("Loop stopped!");
    }

    public static getFpsGameAverage(): number {
      return 1000 / Loop.timeLastFrameGameAvg;
    }
    public static getFpsRealAverage(): number {
      return 1000 / Loop.timeLastFrameRealAvg;
    }

    private static loop(): void {
      let time: number;
      time = performance.now();
      Loop.timeFrameReal = time - Loop.timeLastFrameReal;
      Loop.timeLastFrameReal = time;

      time = Time.game.get();
      Loop.timeFrameGame = time - Loop.timeLastFrameGame;
      Loop.timeLastFrameGame = time;

      Loop.timeLastFrameGameAvg = ((Loop.framesToAverage - 1) * Loop.timeLastFrameGameAvg + Loop.timeFrameGame) / Loop.framesToAverage;
      Loop.timeLastFrameRealAvg = ((Loop.framesToAverage - 1) * Loop.timeLastFrameRealAvg + Loop.timeFrameReal) / Loop.framesToAverage;

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