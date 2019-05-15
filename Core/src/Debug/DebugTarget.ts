namespace Fudge {
    export abstract class DebugTarget {
        public delegates: MapDebugFilterToFunction;
        public static mergeArguments(_message: Object, _args: Object[] = null): string {
            let out: string = JSON.stringify(_message);
            if (_args)
                out += "\n" + JSON.stringify(_args, null, 2);
            return out;
        }
    }
}