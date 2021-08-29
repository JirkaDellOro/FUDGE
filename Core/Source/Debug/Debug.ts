// / <reference path="DebugTarget.ts"/>
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugConsole.ts"/>
namespace FudgeCore {
  /**
   * The Debug-Class offers functions known from the console-object and additions, 
   * routing the information to various {@link DebugTarget}s that can be easily defined by the developers and registerd by users
   * Override functions in subclasses of {@link DebugTarget} and register them as their delegates
   */
  export class Debug {
    /**
     * For each set filter, this associative array keeps references to the registered delegate functions of the chosen {@link DebugTarget}s
     */
    private static delegates: { [filter: number]: MapDebugTargetToDelegate } = Debug.setupConsole();

    /**
     * De- / Activate a filter for the given DebugTarget. 
     */
    public static setFilter(_target: DebugTarget, _filter: DEBUG_FILTER): void {
      for (let filter in Debug.delegates)
        Debug.delegates[filter].delete(_target);

      for (let filter in DEBUG_FILTER) {
        let parsed: number = parseInt(filter);
        if (isNaN(parsed))
          break;
        if ([DEBUG_FILTER.MESSAGES, DEBUG_FILTER.FORMAT, DEBUG_FILTER.ALL].indexOf(parsed) != -1)
          // dont delegate combos... 
          continue;
        if (_filter & parsed)
          Debug.delegates[parsed].set(_target, _target.delegates[parsed]);
      }
    }

    /**
     * Info(...) displays additional information with low priority
     */
    public static info(_message: unknown, ..._args: unknown[]): void {
      Debug.delegate(DEBUG_FILTER.INFO, _message, _args);
    }
    /**
     * Displays information with medium priority
     */
    public static log(_message: unknown, ..._args: unknown[]): void {
      Debug.delegate(DEBUG_FILTER.LOG, _message, _args);
    }
    /**
     * Displays information about non-conformities in usage, which is emphasized e.g. by color
     */
    public static warn(_message: unknown, ..._args: unknown[]): void {
      Debug.delegate(DEBUG_FILTER.WARN, _message, _args);
    }
    /**
     * Displays critical information about failures, which is emphasized e.g. by color
     */
    public static error(_message: unknown, ..._args: unknown[]): void {
      Debug.delegate(DEBUG_FILTER.ERROR, _message, _args);
    }
    /**
     * Displays messages from FUDGE
     */
    public static fudge(_message: unknown, ..._args: unknown[]): void {
      Debug.delegate(DEBUG_FILTER.FUDGE, _message, _args);
    }
    /**
     * Clears the output and removes previous messages if possible
     */
    public static clear(): void {
      Debug.delegate(DEBUG_FILTER.CLEAR, null, null);
    }
    /**
     * Opens a new group for messages
     */
    public static group(_name: string): void {
      Debug.delegate(DEBUG_FILTER.GROUP, _name, null);
    }
    /**
     * Opens a new group for messages that is collapsed at first
     */
    public static groupCollapsed(_name: string): void {
      Debug.delegate(DEBUG_FILTER.GROUPCOLLAPSED, _name, null);
    }
    /**
     * Closes the youngest group
     */
    public static groupEnd(): void {
      Debug.delegate(DEBUG_FILTER.GROUPEND, null, null);
    }
    /**
     * Log a branch of the node hierarchy
     */
    public static branch(_branch: Node): void {
      if (_branch.nChildren > 0)
        Debug.group(_branch.name);
      else
        Debug.fudge(_branch.name);

      for (let child of _branch.getChildren()) Debug.branch(child);

      if (_branch.nChildren > 0)
        Debug.groupEnd();
    }

    /**
     * Displays messages about the source of the debug call
     */
    public static source(_message: unknown, ..._args: unknown[]): void {
      Debug.delegate(DEBUG_FILTER.SOURCE, _message, _args);
    }

    /**
     * Lookup all delegates registered to the filter and call them using the given arguments
     */
    private static delegate(_filter: DEBUG_FILTER, _message: unknown, _args: unknown[]): void {
      if (_filter == DEBUG_FILTER.LOG || _filter == DEBUG_FILTER.WARN || _filter == DEBUG_FILTER.ERROR) {
        if (Debug.delegates[DEBUG_FILTER.SOURCE])
          for (let delegate of Debug.delegates[DEBUG_FILTER.SOURCE].values())
            if (delegate) {
              let trace: string[] = new Error("Test").stack.split("\n");
              delegate(trace[3]);
            }
      }
      let delegates: MapDebugTargetToDelegate = Debug.delegates[_filter];
      for (let delegate of delegates.values())
        if (delegate)
          if (_args && _args.length > 0)
            delegate(_message, ..._args);
          else
            delegate(_message);

    }
    /**
     * setup routing to standard console
     */
    private static setupConsole(): {} {
      let result: { [filter: number]: MapDebugTargetToDelegate } = {};
      let filters: DEBUG_FILTER[] = [
        DEBUG_FILTER.INFO, DEBUG_FILTER.LOG, DEBUG_FILTER.WARN, DEBUG_FILTER.ERROR, DEBUG_FILTER.FUDGE,
        DEBUG_FILTER.CLEAR, DEBUG_FILTER.GROUP, DEBUG_FILTER.GROUPCOLLAPSED, DEBUG_FILTER.GROUPEND,
        DEBUG_FILTER.SOURCE
      ];

      for (let filter of filters)
        result[filter] = new Map([[DebugConsole, DebugConsole.delegates[filter]]]);

      result[DEBUG_FILTER.SOURCE].delete(DebugConsole);

      return result;
    }
  }
}