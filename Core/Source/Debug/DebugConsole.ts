// / <reference path="DebugTarget.ts"/>
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
      [DEBUG_FILTER.FUDGE]: DebugConsole.fudge,
      [DEBUG_FILTER.CLEAR]: console.clear,
      [DEBUG_FILTER.GROUP]: console.group,
      [DEBUG_FILTER.GROUPCOLLAPSED]: console.groupCollapsed,
      [DEBUG_FILTER.GROUPEND]: console.groupEnd,
      [DEBUG_FILTER.SOURCE]: DebugConsole.source
    };

    /**
     * Should be used to display uncritical state information of FUDGE, only visible in browser's verbose mode
     */
    public static fudge(_message: Object, ..._args: Object[]): void {
      console.debug(DEBUG_SYMBOL[DEBUG_FILTER.FUDGE], _message, ..._args);
    }

    /**
     * Displays an extra line with information about the source of the debug message
     */
    public static source(_message: Object, ..._args: Object[]): void {
      console.log(DEBUG_SYMBOL[DEBUG_FILTER.SOURCE], _message, ..._args);
    }
  }
}