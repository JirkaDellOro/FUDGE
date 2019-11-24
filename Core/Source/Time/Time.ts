namespace FudgeCore {
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.  
     * Supports interval- and timeout-callbacks identical with standard Javascript but with respect to the scaled time
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Time extends EventTarget {
        private static gameTime: Time = new Time();
        private start: number;
        private scale: number;
        private offset: number;
        private lastCallToElapsed: number;
        private timers: Timers = {};
        private idTimerNext: number = 0;

        constructor() {
            super();
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }

        /**
         * Returns the game-time-object which starts automatically and serves as base for various internal operations. 
         */
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
            //TODO: catch scale=0
            this.rescaleAllTimers();
            this.getElapsedSincePreviousCall();
            this.dispatchEvent(new Event(EVENT.TIME_SCALED));
        }

        /**
         * Retrieves the current scaling of this time
         */
        public getScale(): number {
            return this.scale;
        }

        /**
         * Retrieves the offset of this time
         */
        public getOffset(): number {
            return this.offset;
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
             /**
         * Stops and deletes all [[Timer]]s attached. Should be called before this Time-object leaves scope
         */
        public clearAllTimers(): void {
            for (let id in this.timers) {
                this.deleteTimer(Number(id));
            }
        }

        /**
         * Recreates [[Timer]]s when scaling changes
         */
        public rescaleAllTimers(): void {
            for (let id in this.timers) {
                let timer: Timer = this.timers[id];
                timer.clear();
                if (!this.scale)
                    // Time has stopped, no need to replace cleared timers
                    continue;

                this.timers[id] = Timer.getRescaled(timer);
            }
        }

        /**
         * Deletes [[Timer]] found using the id of the connected interval/timeout-object
         * @param _id 
         */
        public deleteTimerByInternalId(_id: number): void {
            for (let id in this.timers) {
                let timer: Timer = this.timers[id];
                if (timer.id == _id) {
                    timer.clear();
                    delete this.timers[id];
                }
            }
        }

        public setTimer(_timeout: number, _count: number, _callback: Function, _arguments: Object[] = null): number {
            let timer: Timer = new Timer(this, _timeout, _count, _callback, _arguments);
            this.timers[++this.idTimerNext] = timer;
            return this.idTimerNext;
        }

        public deleteTimer(_id: number): void {
            this.timers[_id].clear();
            delete this.timers[_id];
        }
        //#endregion
    }
}