/// <reference path="DebugTarget.ts"/>
namespace FudgeCore {
    /**
     * Routing to the standard-console
     */
    export class DebugConsole extends DebugTarget {
        public static delegates: MapDebugFilterToDelegate = {
            [DEBUG_FILTER.INFO]: console.info,
            [DEBUG_FILTER.LOG]: console.log,
            [DEBUG_FILTER.WARN]: console.warn,
            [DEBUG_FILTER.ERROR]: console.error,
            [DEBUG_FILTER.CLEAR]: console.clear,
            [DEBUG_FILTER.GROUP]: console.group,
            [DEBUG_FILTER.GROUPCOLLAPSED]: console.groupCollapsed,
            [DEBUG_FILTER.GROUPEND]: console.groupEnd
        };
    }
}