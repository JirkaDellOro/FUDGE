namespace Fudge {
    export class DebugConsole {
        public static delegates: MapDebugFilterToFunction = {
            [DEBUG_FILTER.INFO]: console.info,
            [DEBUG_FILTER.LOG]: console.log,
            [DEBUG_FILTER.WARN]: console.warn,
            [DEBUG_FILTER.ERROR]: console.error
        };
    }
}