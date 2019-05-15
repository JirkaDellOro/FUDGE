/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
namespace Fudge {
    export class Debug {
        // TODO: implement anonymous function setting up all filters
        private static delegates: { [filter: number]: MapDebugTargetToFunction } = {
            [DEBUG_FILTER.INFO]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.INFO]]]),
            [DEBUG_FILTER.LOG]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.LOG]]]),
            [DEBUG_FILTER.WARN]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.WARN]]]),
            [DEBUG_FILTER.ERROR]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.ERROR]]])
        };

        public static setFilter(_target: DebugTarget, _filter: DEBUG_FILTER): void {
            for (let filter in Debug.delegates)
                Debug.delegates[filter].delete(_target);

            for (let filter in DEBUG_FILTER) {
                let parsed: number = parseInt(filter);
                if (parsed == DEBUG_FILTER.ALL)
                    break;
                if (_filter & parsed)
                    Debug.delegates[_filter].set(_target, _target.delegates[_filter]);
            }
        }

        public static info(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.INFO, _message, _args);
        }
        public static log(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.LOG, _message, _args);
        }
        public static warn(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.WARN, _message, _args);
        }
        public static error(_message: Object, ..._args: Object[]): void {
            Debug.delegate(DEBUG_FILTER.ERROR, _message, _args);
        }

        private static delegate(_filter: DEBUG_FILTER, _message: Object, _args: Object[]): void {
            let delegates: MapDebugTargetToFunction = Debug.delegates[_filter];
            for (let delegate of delegates.values())
                if (_args.length > 0)
                    delegate(_message, _args);
                else
                    delegate(_message);
        }
    }
}