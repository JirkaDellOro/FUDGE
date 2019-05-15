/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
namespace Fudge {
    export class Debug {
        // public static textArea: HTMLTextAreaElement;
        // private static delegates: { [filter: number]: MapDebugTargetToFunction } = {
        //     [DEBUG_FILTER.INFO]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.INFO]])
        //     // [DEBUG_FILTER.LOG]: { typeof DebugConsole: DebugConsole.delegates[DEBUG_FILTER.LOG] },
        //     // [DEBUG_FILTER.WARN]: { typeof DebugConsole: DebugConsole.delegates[DEBUG_FILTER.WARN] },
        //     // [DEBUG_FILTER.ERROR]: { typeof DebugConsole: DebugConsole.delegates[DEBUG_FILTER.ERROR] }
        // };
        
        private static delegates: { [filter: string]: MapDebugTargetToFunction } = {
            [DEBUG_FILTER.INFO]: { [DEBUG_TARGET.CONSOLE]: DebugConsole.delegates[DEBUG_FILTER.INFO] },
            [DEBUG_FILTER.LOG]: { [DEBUG_TARGET.CONSOLE]: DebugConsole.delegates[DEBUG_FILTER.LOG] },
            [DEBUG_FILTER.WARN]: { [DEBUG_TARGET.CONSOLE]: DebugConsole.delegates[DEBUG_FILTER.WARN] },
            [DEBUG_FILTER.ERROR]: { [DEBUG_TARGET.CONSOLE]: DebugConsole.delegates[DEBUG_FILTER.ERROR] }
        };

        public static mergeArguments(_message: Object, ..._args: Object[]): string {
            let out: string = JSON.stringify(_message);
            if (_args.length > 0)
                out += "\n" + JSON.stringify(_args, null, 2);
            return out;
        }

        public static setFilter(_target: DEBUG_TARGET, _filter: DEBUG_FILTER): void {
            for (let filter in Debug.delegates)
                delete (Debug.delegates[filter][_target]);

            switch (_target) {
                case DebugConsole:
                    Debug.setFilterConsole(_filter);
                    break;
                case DEBUG_TARGET.ALERT:
                    Debug.delegates[DEBUG_FILTER.INFO][DEBUG_TARGET.ALERT] = DebugAlert.delegates[DEBUG_FILTER.INFO];
                    break;
            }
        }

        public static setFilterConsole(_filter: DEBUG_FILTER): void {
            if (_filter | DEBUG_FILTER.INFO)
                Debug.delegates[DEBUG_FILTER.INFO][DebugConsole] = console.info;
        }

        public static info(_message: Object, ..._args: Object[]): void {
            let delegates: MapDebugTargetToFunction = Debug.delegates[DEBUG_FILTER.INFO];
            for (let target in delegates)
                if (_args.length > 0)
                    delegates[target](_message, _args);
                else
                    delegates[target](_message);
        }
    }
}