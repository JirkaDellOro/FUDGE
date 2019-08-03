///<reference path="../Event/Event.ts"/>
namespace Fudge {
    /**
     * Core loop of a Fudge application. Initializes automatically and must be startet via Loop.start().
     * it then fires EVENT.ANIMATION_FRAME to all listeners added at each animation frame requested from the host window
     */
    export class Loop extends EventTargetStatic {
        private static running: boolean = false;
        /**
         * Start the core loop
         */
        public static start(): void {
            if (!Loop.running)
                Loop.loop(performance.now());
            Debug.log("Loop running");
        }
        private static loop(_timestamp: number): void {
            // TODO: do something with timestamp... store in gametime, since there actually is already a timestamp in the event by default
            let event: Event = new Event(EVENT.LOOP_FRAME);
            Loop.targetStatic.dispatchEvent(event);
            window.requestAnimationFrame(Loop.loop);
        }
    }

}