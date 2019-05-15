// <reference path="DebugAlert.ts"/>
namespace Fudge {
    export enum DEBUG_FILTER {
        NONE = 0x00,
        INFO = 0x01,
        LOG = 0x02,
        WARN = 0x04,
        ERROR = 0x08,
        ALL = INFO | LOG | WARN | ERROR
    }
    export enum DEBUG_TARGET {
        CONSOLE = "console",
        ALERT = "alert",
        TEXTAREA = "textarea",
        FILE = "file",
        SERVER = "server"
    }

    export interface MapDebugTargetToFunction { [target: string]: Function; }
    // export type MapDebugTargetToFunction = Map<DebugTarget, Function>;
    export interface MapDebugFilterToFunction { [filter: number]: Function; }

}