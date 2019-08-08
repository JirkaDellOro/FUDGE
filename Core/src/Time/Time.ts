namespace Fudge {

    interface TimerData {
        type: "Intervall" | "Timeout";
        startTime: number;
    }

    interface Timers {
        [id: number]: TimerData;
    }

    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.  
     * Supports interval- and timeout-callbacks identical with standard Javascript but with respect to the scaled time
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Time {
        private static gameTime: Time = new Time();
        private start: number;
        private scale: number;
        private offset: number;
        private lastCallToElapsed: number;
        private timers: Timers = {};

        constructor() {
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }

        public static get game(): Time {
            return Time.gameTime;
        }

        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        public get(): number {
            return this.offset + this.scale * (performance.now() - this.start);
        }

        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        public set(_time: number = 0): void {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }

        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1) 
         * @param _scale The desired scaling (default 1.0)
         */
        public setScale(_scale: number = 1.0): void {
            this.set(this.get());
            this.scale = _scale;
            this.getElapsedSincePreviousCall();
        }

        /**
         * Retrieves the current scaling of this time
         */
        public getScale(): number {
            return this.scale;
        }

        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        public getElapsedSincePreviousCall(): number {
            let current: number = this.get();
            let elapsed: number = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }

        //#region Timers
        // TODO: examine if web-workers would enhance performance here!
        public setTimeout(_callback: TimerHandler, _timeout: number, ..._arguments: Object[]): number {
            // TODO: handle time scale and reset 
            let id: number = window.setInterval(_callback, _timeout, _arguments);
            let timer: TimerData = { type: "Timeout", startTime: this.get() };
            this.timers[id] = timer;
            return id;
        }
        public setInterval(_callback: TimerHandler, _timeout: number, ..._arguments: Object[]): number {
            // TODO: handle time scale and reset 
            let id: number = window.setInterval(_callback, _timeout, _arguments);
            let timer: TimerData = { type: "Intervall", startTime: this.get() };
            this.timers[id] = timer;
            return id;
        }
        public clearTimeout(_id: number): void {
            window.clearInterval(_id);
            delete this.timers[_id];
        }
        public clearInterval(_id: number): void {
            window.clearInterval(_id);
            delete this.timers[_id];
        }

        public clearAllTimers(): void {
            for (let id in this.timers) {
                if (this.timers[id].type == "Timeout")
                    this.clearTimeout(parseInt(id));
                else
                    this.clearInterval(parseInt(id));
            }
        }
        //#endregion
    }
}