/// <reference path="DebugTarget.ts"/>
namespace FudgeCore {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    export class DebugTextArea extends DebugTarget {
        public static textArea: HTMLTextAreaElement = document.createElement("textarea");
        public static delegates: MapDebugFilterToDelegate = {
            [DEBUG_FILTER.INFO]: DebugTextArea.createDelegate("Info"),
            [DEBUG_FILTER.LOG]: DebugTextArea.createDelegate("Log"),
            [DEBUG_FILTER.WARN]: DebugTextArea.createDelegate("Warn"),
            [DEBUG_FILTER.ERROR]: DebugTextArea.createDelegate("Error"),
            [DEBUG_FILTER.CLEAR]: DebugTextArea.clear
        };

        public static clear(): void {
          DebugTextArea.textArea.textContent = "";
        }

        public static createDelegate(_headline: string): Function {
            let delegate: Function = function (_message: Object, ..._args: Object[]): void {
                let out: string = _headline + "\n" + DebugTarget.mergeArguments(_message, _args);
                DebugTextArea.textArea.textContent += out;
            };
            return delegate;
        }
    }
}