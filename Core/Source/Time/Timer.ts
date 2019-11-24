namespace FudgeCore {
    export interface Timers {
        [id: number]: Timer;
    }

    export class Timer {
        public active: boolean;
        public count: number;
        private callback: Function;
        private time: Time;
        private elapse: number;
        private arguments: Object[];
        // private startTimeReal: number;
        private timeoutReal: number;
        private idWindow: number;

        constructor(_time: Time, _elapse: number, _count: number, _callback: Function, _arguments: Object[]) {
            this.time = _time;
            this.elapse = _elapse;
            this.arguments = _arguments;
            // this.startTimeReal = performance.now();
            this.callback = _callback;
            this.count = _count;

            let scale: number = Math.abs(_time.getScale());

            if (!scale) {
                // Time is stopped, timer won't be active
                this.active = false;
                return;
            }

            this.timeoutReal = this.elapse / scale;

            // if (this.type == TIMER_TYPE.TIMEOUT) {
            //     let callback: Function = (): void => {
            //         _time.deleteTimerByInternalId(this.id);
            //         _callback(_arguments);
            //     };
            //     id = window.setTimeout(callback, this.timeoutReal);
            // }
            // else
            let callback: Function = (): void => {
                _callback(this.arguments);
                if (this.count > 0)
                    if (--this.count == 0)
                        _time.deleteTimerByItsInternalId(this.idWindow);

            };

            this.idWindow = window.setInterval(callback, this.timeoutReal, _arguments);
            this.active = true;
        }

        public static getRescaled(_timer: Timer): Timer {
            // if (timer.type == TIMER_TYPE.TIMEOUT && timer.active)
            //     // for an active timeout-timer, calculate the remaining time to timeout
            //     timeout = (performance.now() - timer.startTimeReal) / timer.timeoutReal;
            let rescaled: Timer = new Timer(_timer.time, _timer.elapse, _timer.count, _timer.callback, _timer.arguments);
            return rescaled;
        }

        public get id(): number {
            return this.idWindow;
        }

        public clear(): void {
            // if (this.type == TIMER_TYPE.TIMEOUT) {
            //     if (this.active)
            //         // save remaining time to timeout as new timeout for restart
            //         this.timeout = this.timeout * (1 - (performance.now() - this.startTimeReal) / this.timeoutReal);
            //     window.clearTimeout(this.id);
            // }
            // else
            // TODO: reusing timer starts interval anew. Should be remaining interval as timeout, then starting interval anew 
            window.clearInterval(this.idWindow);
            this.active = false;
        }
    }
}