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
    CLEAR = 0x10,
    GROUP = 0x20,
    GROUPCOLLAPSED = 0x40,
    GROUPEND = 0x80,
    MESSAGES = INFO | LOG | WARN | ERROR,
    FORMAT = CLEAR | GROUP | GROUPCOLLAPSED | GROUPEND,
    ALL = MESSAGES | FORMAT
  }

  export type MapDebugTargetToDelegate = Map<DebugTarget, Function>;
  export interface MapDebugFilterToDelegate { [filter: number]: Function; }
}