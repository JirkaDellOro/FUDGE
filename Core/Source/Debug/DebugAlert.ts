// / <reference path="DebugTarget.ts"/>
namespace FudgeCore {
    /**
     * Routing to the alert box
     */
    export class DebugAlert extends DebugTarget {
        public static delegates: MapDebugFilterToDelegate = {
            [DEBUG_FILTER.INFO]: DebugAlert.createDelegate("Info"),
            [DEBUG_FILTER.LOG]: DebugAlert.createDelegate("Log"),
            [DEBUG_FILTER.WARN]: DebugAlert.createDelegate("Warn"),
            [DEBUG_FILTER.ERROR]: DebugAlert.createDelegate("Error"),
            [DEBUG_FILTER.FUDGE]: DebugAlert.createDelegate("FUDGE")
        };
        public static createDelegate(_headline: string): Function {
            let delegate: Function = function (_message: Object, ..._args: Object[]): void {
                let args: string[] = _args.map(_arg => _arg.toString()); 
                let out: string = _headline + "\n\n" + DebugTarget.mergeArguments(_message, args);
                alert(out);
            };
            return delegate;
        }
    }
}