namespace FudgeCore {
    enum TIMER_TYPE {
        INTERVAL,
        TIMEOUT
    }

    interface Timers {
        [id: number]: Timer;
    }

    class Timer {
        active: boolean;
        type: TIMER_TYPE;
        callback: Function;
        timeout: number;
        arguments: Object[];
        startTimeReal: number;
        timeoutReal: number;
        id: number;

        constructor(_time: Time, _type: TIMER_TYPE, _callback: Function, _timeout: number, _arguments: Object[]) {
            this.type = _type;
            this.timeout = _timeout;
            this.arguments = _arguments;
            this.startTimeReal = performance.now();
            this.callback = _callback;

            let scale: number = Math.abs(_time.getScale());

            if (!scale) {
                // Time is stopped, timer won't be active
                this.active = false;
                return;
            }

            let id: number;
            this.timeoutReal = this.timeout / scale;

            if (this.type == TIMER_TYPE.TIMEOUT) {
                let callback: Function = (): void => {
                    _time.deleteTimerByInternalId(this.id);
                    _callback(_arguments);
                };
                id = window.setTimeout(callback, this.timeoutReal);
            }
            else
                id = window.setInterval(_callback, this.timeoutReal, _arguments);

            this.id = id;
            this.active = true;
        }

        public clear(): void {
            if (this.type == TIMER_TYPE.TIMEOUT) {
                if (this.active)
                    // save remaining time to timeout as new timeout for restart
                    this.timeout = this.timeout * (1 - (performance.now() - this.startTimeReal) / this.timeoutReal);
                window.clearTimeout(this.id);
            }
            else
                // TODO: reusing timer starts interval anew. Should be remaining interval as timeout, then starting interval anew 
                window.clearInterval(this.id);
            this.active = false;
        }
    }

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
         * See Javascript documentation. Creates an internal [[Timer]] object
         * @param _callback
         * @param _timeout 
         * @param _arguments 
         */
        public setTimeout(_callback: Function, _timeout: number, ..._arguments: Object[]): number {
            return this.setTimer(TIMER_TYPE.TIMEOUT, _callback, _timeout, _arguments);
        }
        /**
         * See Javascript documentation. Creates an internal [[Timer]] object
         * @param _callback 
         * @param _timeout 
         * @param _arguments 
         */
        public setInterval(_callback: Function, _timeout: number, ..._arguments: Object[]): number {
            return this.setTimer(TIMER_TYPE.INTERVAL, _callback, _timeout, _arguments);
        }
        /**
         * See Javascript documentation
         * @param _id 
         */
        public clearTimeout(_id: number): void {
            this.deleteTimer(_id);
        }
        /**
         * See Javascript documentation
         * @param _id 
         */
        public clearInterval(_id: number): void {
            this.deleteTimer(_id);
        }

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

                let timeout: number = timer.timeout;
                // if (timer.type == TIMER_TYPE.TIMEOUT && timer.active)
                //     // for an active timeout-timer, calculate the remaining time to timeout
                //     timeout = (performance.now() - timer.startTimeReal) / timer.timeoutReal;
                let replace: Timer = new Timer(this, timer.type, timer.callback, timeout, timer.arguments);
                this.timers[id] = replace;
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

        private setTimer(_type: TIMER_TYPE, _callback: Function, _timeout: number, _arguments: Object[]): number {
            let timer: Timer = new Timer(this, _type, _callback, _timeout, _arguments);
            this.timers[++this.idTimerNext] = timer;
            return this.idTimerNext;
        }

        private deleteTimer(_id: number): void {
            this.timers[_id].clear();
            delete this.timers[_id];
        }
        //#endregion
    }
}