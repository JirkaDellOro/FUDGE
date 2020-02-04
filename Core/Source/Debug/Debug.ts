/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
namespace FudgeCore {
  /**
   * The Debug-Class offers functions known from the console-object and additions, 
   * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
   * Override functions in subclasses of [[DebugTarget]] and register them as their delegates
   */
  export class Debug {
    /**
     * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
     */
    // TODO: implement anonymous function setting up all filters
    private static delegates: { [filter: number]: MapDebugTargetToDelegate } = {
      [DEBUG_FILTER.INFO]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.INFO]]]),
      [DEBUG_FILTER.LOG]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.LOG]]]),
      [DEBUG_FILTER.WARN]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.WARN]]]),
      [DEBUG_FILTER.ERROR]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.ERROR]]]),
      [DEBUG_FILTER.CLEAR]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.CLEAR]]]),
      [DEBUG_FILTER.GROUP]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.GROUP]]]),
      [DEBUG_FILTER.GROUPCOLLAPSED]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.GROUPCOLLAPSED]]]),
      [DEBUG_FILTER.GROUPEND]: new Map([[DebugConsole, DebugConsole.delegates[DEBUG_FILTER.GROUPEND]]])
    };

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
    public static info(_message: Object, ..._args: Object[]): void {
      Debug.delegate(DEBUG_FILTER.INFO, _message, _args);
    }
    /**
     * Displays information with medium priority
     */
    public static log(_message: Object, ..._args: Object[]): void {
      Debug.delegate(DEBUG_FILTER.LOG, _message, _args);
    }
    /**
     * Displays information about non-conformities in usage, which is emphasized e.g. by color
     */
    public static warn(_message: Object, ..._args: Object[]): void {
      Debug.delegate(DEBUG_FILTER.WARN, _message, _args);
    }
    /**
     * Displays critical information about failures, which is emphasized e.g. by color
     */
    public static error(_message: Object, ..._args: Object[]): void {
      Debug.delegate(DEBUG_FILTER.ERROR, _message, _args);
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
     * Lookup all delegates registered to the filter and call them using the given arguments
     */
    private static delegate(_filter: DEBUG_FILTER, _message: Object, _args: Object[]): void {
      let delegates: MapDebugTargetToDelegate = Debug.delegates[_filter];
      for (let delegate of delegates.values())
        if (_args && _args.length > 0)
          delegate(_message, ..._args);
        else
          delegate(_message);
    }
  }
}