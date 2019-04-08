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
                Loop.loop();
            console.log("Loop running");
        }
        private static loop(): void {
            window.requestAnimationFrame(Loop.loop);
            Loop.targetStatic.dispatchEvent(new Event(EVENT.ANIMATION_FRAME));
        }
    }

}