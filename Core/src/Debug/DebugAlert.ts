namespace Fudge {
    export class DebugAlert {
        public static delegates: MapDebugFilterToFunction = {
            [DEBUG_FILTER.INFO]: DebugAlert.createDelegate("Info")
        };
        public static createDelegate(_headline: string): Function {
            let delegate: Function = function (_message: Object, ..._args: Object[]): void {
                let out: string = _headline + "\n\n" + Debug.mergeArguments(_message, _args);
                alert(out);
            };
            return delegate;
        }
    }
}