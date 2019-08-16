// <reference path="DebugAlert.ts"/>
namespace FudgeCore {
    /**
     * The filters corresponding to debug activities, more to come
     */
    export enum DEBUG_FILTER {
        NONE = 0x00,
        INFO = 0x01,
        LOG = 0x02,
        WARN = 0x04,
        ERROR = 0x08,
        ALL = INFO | LOG | WARN | ERROR
    }
    // reminescent of an early attempt of Debug
    // export enum DEBUG_TARGET {
    //     CONSOLE = "console",
    //     ALERT = "alert",
    //     TEXTAREA = "textarea",
    //     DIALOG = "dialog",
    //     FILE = "file",
    //     SERVER = "server"
    // }

    // export interface MapDebugTargetToFunction { [target: string]: Function; }
    export type MapDebugTargetToDelegate = Map<DebugTarget, Function>;
    export interface MapDebugFilterToDelegate { [filter: number]: Function; }
}