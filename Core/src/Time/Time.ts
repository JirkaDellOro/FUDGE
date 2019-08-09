namespace Fudge {
    enum TIMER_TYPE {
        INTERVAL,
        TIMEOUT
    }

    class Timer {
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
            this.timeoutReal = this.timeout / _time.getScale();

            this.callback = _callback;

            let id: number;
            if (this.type == TIMER_TYPE.TIMEOUT) {
                let callback: Function = (): void => {
                    _time.clearTimeout(id);
                    _callback(_arguments);
                };
                id = window.setTimeout(callback, _timeout / _time.getScale());
            }
            else
                id = window.setInterval(_callback, _timeout / _time.getScale(), _arguments);

            this.id = id;
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
        private timers: Timer[] = [];

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
            this.rescaleAllTimers();
            this.scale = _scale;
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
        public setTimeout(_callback: Function, _timeout: number, ..._arguments: Object[]): number {
            return this.setTimer(TIMER_TYPE.TIMEOUT, _callback, _timeout, _arguments);
        }
        public setInterval(_callback: Function, _timeout: number, ..._arguments: Object[]): number {
            return this.setTimer(TIMER_TYPE.INTERVAL, _callback, _timeout, _arguments);
        }
        public clearTimeout(_id: number): void {
            window.clearInterval(_id);
            this.deleteTimer(_id);
        }
        public clearInterval(_id: number): void {
            window.clearInterval(_id);
            this.deleteTimer(_id);
        }

        /**
         * Stops and deletes all timers attached. Should be called before this Time-object leaves scope
         */
        public clearAllTimers(): void {
            for (let id in this.timers) {
                if (this.timers[id].type == TIMER_TYPE.TIMEOUT)
                    this.clearTimeout(parseInt(id));
                else
                    this.clearInterval(parseInt(id));
            }
        }

        public rescaleAllTimers(): void {
            for (let timer of this.timers) {
                if (timer.type == TIMER_TYPE.TIMEOUT)
                    this.clearTimeout(timer.id);
                else
                    this.clearInterval(timer.id);

                // rescaling
                let timeoutLeft: number = (performance.now() - timer.startTimeReal) / timer.timeoutReal;
                this.setTimer(timer.type, timer.callback, timeoutLeft, timer.arguments);
            }
        }

        private setTimer(_type: TIMER_TYPE, _callback: Function, _timeout: number, _arguments: Object[]): number {
            let timer: Timer = new Timer(this, _type, _callback, _timeout, _arguments);
            this.timers.push(timer);
            return timer.id;
        }

        private deleteTimer(_id: number): void {
            for (let i: number = this.timers.length - 1; i >= 0; i--)
                if (this.timers[i].id == _id)
                    this.timers.splice(i, 1);
        }
        //#endregion
    }
}