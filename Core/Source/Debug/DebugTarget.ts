namespace FudgeCore {
  /**
   * Base class for the different DebugTargets, mainly for technical purpose of inheritance
   */
  export abstract class DebugTarget {
    public delegates: MapDebugFilterToDelegate;
    public static mergeArguments(_message: Object, ..._args: Object[]): string {
      let out: string = _message.toString(); //JSON.stringify(_message);
      for (let arg of _args)
        if (arg instanceof Number)
          out += ", " + arg.toPrecision(2).toString(); //JSON.stringify(arg, null, 2);
        else
          out += ", " + arg.toString(); //JSON.stringify(arg, null, 2);
      return out;
    }
  }
}