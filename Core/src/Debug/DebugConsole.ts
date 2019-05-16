/// <reference path="DebugTarget.ts"/>
namespace Fudge {
    /**
     * Routing to the standard-console
     */
    export class DebugConsole extends DebugTarget {
        public static delegates: MapDebugFilterToFunction = {
            [DEBUG_FILTER.INFO]: console.info,
            [DEBUG_FILTER.LOG]: console.log,
            [DEBUG_FILTER.WARN]: console.warn,
            [DEBUG_FILTER.ERROR]: console.error
        };
    }
}