/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
namespace FudgeCore {
    /**
     * The Debug-Class offers functions known from the console-object and additions, 
     * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
     */
    export class Debug {
        /**
         * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
         */
        // TODO: implement anonymous function setting up all filters
        private static delegates: { [filter: number]: MapDebugTargetToDelegate } = {
            [DEBUG_FILTER.INFO]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.INFO]]]),
            [DEBUG_FILTER.LOG]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.LOG]]]),
            [DEBUG_FILTER.WARN]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.WARN]]]),
            [DEBUG_FILTER.ERROR]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.ERROR]]])
        };

        /**
         * De- / Activate a filter for the given DebugTarget. 
         * @param _target
         * @param _filter 
         */
        public static setFilter(_target: DebugTarget, _filter: DEBUG_FILTER): void {
            for (let filter in Debug.delegates)
                Debug.delegates[filter].delete(_target);

            for (let filter in DEBUG_FILTER) {
                let parsed: number = parseInt(filter);
                if (parsed == DEBUG_FILTER.ALL)
                    break;
                if (_filter & parsed)
                    Debug.delegates[parsed].set(_target, _target.delegates[parsed]);
            }
        }

        /**
         * Debug function to be implemented by the DebugTarget. 
         * info(...) displays additional information with low priority
         * @param _message
         * @param _args 
         */
        public static info(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.INFO, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget. 
         * log(...) displays information with medium priority
         * @param _message
         * @param _args 
         */
        public static log(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.LOG, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget. 
         * warn(...) displays information about non-conformities in usage, which is emphasized e.g. by color
         * @param _message
         * @param _args 
         */
        public static warn(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.WARN, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget. 
         * error(...) displays critical information about failures, which is emphasized e.g. by color
         * @param _message
         * @param _args 
         */
        public static error(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.ERROR, _message, _args);
        }
        /**
         * Lookup all delegates registered to the filter and call them using the given arguments
         * @param _filter 
         * @param _message 
         * @param _args 
         */
        private static delegate(_filter: DEBUG_FILTER, _message: Object, _args: Object[]): void {
            let delegates: MapDebugTargetToDelegate = Debug.delegates[_filter];
            for (let delegate of delegates.values())
                if (_args.length > 0)
                    delegate(_message, ..._args);
                else
                    delegate(_message);
        }
    }
}