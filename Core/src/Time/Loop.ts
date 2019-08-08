///<reference path="../Event/Event.ts"/>
///<reference path="../Time/Time.ts"/>
namespace Fudge {
    export enum LOOP_MODE {
        FRAME_REQUEST = "frameRequest",
        TIME_GAME = "timeGame",
        TIME_REAL = "timeReal"
    }
    /**
     * Core loop of a Fudge application. Initializes automatically and must be startet via Loop.start().
     * it then fires EVENT.ANIMATION_FRAME to all listeners added at each animation frame requested from the host window
     */
    export class Loop extends EventTargetStatic {
        public static timeStartGame: number;
        public static timeStartReal: number;
        private static running: boolean = false;
        private static mode: LOOP_MODE = LOOP_MODE.FRAME_REQUEST;
        private static idIntervall: number = 0;
        private static fps: number = 30;

        /**
         * Start the core loop
         */
        public static start(_mode: LOOP_MODE = LOOP_MODE.FRAME_REQUEST, _fps: number = 30): void {
            Loop.stop();

            Loop.timeStartGame = Time.game.get();
            Loop.timeStartReal = performance.now();
            Loop.fps = _fps;
            Loop.mode = _mode;

            let log: string = `Loop starting in mode ${Loop.mode}`;
            if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
                log += ` with attempted ${_fps} fps`;
            Debug.log(log);

            switch (_mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    this.loopFrame();
                    break;
                case LOOP_MODE.TIME_REAL:
                    Loop.idIntervall = window.setInterval(Loop.loopReal, 1000 / this.fps);
                    this.loopReal();
                    break;
                case LOOP_MODE.TIME_GAME:
                    Loop.idIntervall = Time.game.setInterval(Loop.loopGame, 1000 / this.fps);
                    this.loopGame();
                    break;
                default:
                    break;
            }
        }

        public static stop(): void {
            if (!Loop.running)
                return;

            switch (Loop.mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    window.cancelAnimationFrame(Loop.idIntervall);
                    break;
                case LOOP_MODE.TIME_REAL:
                    window.clearInterval(Loop.idIntervall);
                    break;
                case LOOP_MODE.TIME_GAME:
                    Time.game.clearInterval(Loop.idIntervall);
                    break;
                default:
                    break;
            }

            Debug.log("Loop stopped!");
        }

        private static dispatchLoopEvent(): void {
            let event: Event = new Event(EVENT.LOOP_FRAME);
            Loop.targetStatic.dispatchEvent(event);
        }

        private static loopFrame(): void {
            Loop.dispatchLoopEvent();
            Loop.idIntervall = window.requestAnimationFrame(Loop.loopFrame);
        }
        private static loopReal(): void {
            Loop.dispatchLoopEvent();
        }
        private static loopGame(): void {
            Loop.dispatchLoopEvent();
        }
    }

}