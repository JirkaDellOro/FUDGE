var TimeTest;
(function (TimeTest) {
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed
     * since the start of the program but allows for resetting and scaling
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Time {
        constructor() {
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }
        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        get() {
            return this.offset + this.scale * (performance.now() - this.start);
        }
        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        set(_time = 0) {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }
        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1)
         * @param _scale The desired scaling (default 1.0)
         */
        setScale(_scale = 1.0) {
            this.set(this.get());
            this.scale = _scale;
            this.getElapsedSincePreviousCall();
        }
        /**
         * Retrieves the current scaling of this time
         */
        getScale() {
            return this.scale;
        }
        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall() {
            let current = this.get();
            let elapsed = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }
    }
    TimeTest.Time = Time;
})(TimeTest || (TimeTest = {}));
//# sourceMappingURL=Time.js.map