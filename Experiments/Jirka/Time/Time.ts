namespace TimeTest {
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed
     * since the start of the program but allows for resetting and scaling
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Time {
        private start: number;
        private scale: number;
        private offset: number;
        private lastCallToElapsed: number; 

        constructor() {
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }

        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         * # Watch out for headlines
         */
        get(): number {
            return this.offset + this.scale * (performance.now() - this.start);
        }
        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        set(_time: number = 0): void {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }
        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1) 
         * @param _scale The desired scaling (default 1.0)
         */
        setScale(_scale: number = 1.0): void {
            this.set(this.get());
            this.scale = _scale;
            this.getElapsedSincePreviousCall();
        }

        /**
         * Retrieves the current scaling of this time
         */
        getScale(): number {
            return this.scale;
        }
        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall(): number {
            let current: number = this.get();
            let elapsed: number = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }
    }
}