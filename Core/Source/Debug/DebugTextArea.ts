// / <reference path="DebugTarget.ts"/>
namespace FudgeCore {
  /**
   * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
   */
  export class DebugTextArea extends DebugTarget {
    public static textArea: HTMLTextAreaElement = document.createElement("textarea");
    public static autoScroll: boolean = true;

    public static delegates: MapDebugFilterToDelegate = {
      [DEBUG_FILTER.INFO]: DebugTextArea.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.INFO]),
      [DEBUG_FILTER.LOG]: DebugTextArea.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.LOG]),
      [DEBUG_FILTER.WARN]: DebugTextArea.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.WARN]),
      [DEBUG_FILTER.ERROR]: DebugTextArea.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.ERROR]),
      [DEBUG_FILTER.FUDGE]: DebugTextArea.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.FUDGE]),
      [DEBUG_FILTER.CLEAR]: DebugTextArea.clear,
      [DEBUG_FILTER.GROUP]: DebugTextArea.group,
      [DEBUG_FILTER.GROUPCOLLAPSED]: DebugTextArea.group,
      [DEBUG_FILTER.GROUPEND]: DebugTextArea.groupEnd,
      [DEBUG_FILTER.SOURCE]: DebugTextArea.createDelegate(DEBUG_SYMBOL[DEBUG_FILTER.SOURCE])
    };
    private static groups: string[] = [];

    public static clear(): void {
      DebugTextArea.textArea.textContent = "";
      DebugTextArea.groups = [];
    }

    public static group(_name: string): void {
      DebugTextArea.print("▼ " + _name);
      DebugTextArea.groups.push(_name);
    }
    public static groupEnd(): void {
      DebugTextArea.groups.pop();
    }

    public static createDelegate(_headline: string): Function {
      let delegate: Function = function (_message: Object, ..._args: Object[]): void {
        DebugTextArea.print(_headline + " " + DebugTarget.mergeArguments(_message, _args));
      };
      return delegate;
    }

    private static getIndentation(_level: number): string {
      let result: string = "";
      for (let i: number = 0; i < _level; i++)
        result += "| ";
      return result;
    }

    private static print(_text: string): void {
      DebugTextArea.textArea.textContent += DebugTextArea.getIndentation(DebugTextArea.groups.length) + _text + "\n";
      if (DebugTextArea.autoScroll)
        DebugTextArea.textArea.scrollTop = DebugTextArea.textArea.scrollHeight;
    }
  }
}