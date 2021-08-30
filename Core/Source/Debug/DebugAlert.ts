// / <reference path="DebugTarget.ts"/>
namespace FudgeCore {
  /**
   * Routing to the alert box
   */
  export class DebugAlert extends DebugTarget {
    public static delegates: MapDebugFilterToDelegate = {
      [DEBUG_FILTER.INFO]: DebugAlert.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.INFO]),
      [DEBUG_FILTER.LOG]: DebugAlert.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.LOG]),
      [DEBUG_FILTER.WARN]: DebugAlert.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.WARN]),
      [DEBUG_FILTER.ERROR]: DebugAlert.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.ERROR]),
      [DEBUG_FILTER.FUDGE]: DebugAlert.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.FUDGE]),
      [DEBUG_FILTER.SOURCE]: DebugAlert.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.SOURCE])
    };
    public static createDelegate(_headline: string): Function {
      let delegate: Function = function (_message: Object, ..._args: Object[]): void {
        let args: string[] = _args.map(_arg => _arg.toString());
        let out: string = _headline + " " + DebugTarget.mergeArguments(_message, args);
        alert(out);
      };
      return delegate;
    }
  }
}