namespace FudgeCore {
    /**
     * Base class for the different DebugTargets, mainly for technical purpose of inheritance
     */
    export abstract class DebugTarget {
        public delegates: MapDebugFilterToDelegate;
        public static mergeArguments(_message: Object, ..._args: Object[]): string {
            let out: string = JSON.stringify(_message);
            for (let arg of _args)
                out += "\n" + JSON.stringify(arg, null, 2);
            return out;
        }
    }
}