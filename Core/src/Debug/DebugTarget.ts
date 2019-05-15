namespace Fudge {
    export abstract class DebugTarget {
        public delegates: MapDebugFilterToFunction;
        public static mergeArguments(_message: Object, ..._args: Object[]): string {
            let out: string = JSON.stringify(_message);
            for (let arg of _args)
                out += "\n" + JSON.stringify(arg, null, 2);
            return out;
        }
    }
}