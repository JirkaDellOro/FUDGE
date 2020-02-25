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
    FUDGE = 0x10,
    CLEAR = 0x100,
    GROUP = 0x101,
    GROUPCOLLAPSED = 0x102,
    GROUPEND = 0x104,
    MESSAGES = INFO | LOG | WARN | ERROR | FUDGE,
    FORMAT = CLEAR | GROUP | GROUPCOLLAPSED | GROUPEND,
    ALL = MESSAGES | FORMAT
  }

  // Ⓘ Ⓛ Ⓦ Ⓔ ☠ ☢ ⚠ ✎ ✔ ✓ ❌ ⭍ ☈ 🛈 ▣ ◧ ♢ ♦ ⚂ ⛋ ❖ ⬓ ⬒ 🍩 🍫 🍬 🎲 ☕ 🧊
  export const DEBUG_SYMBOL: { [filter: number]: string; } = {
    [DEBUG_FILTER.INFO]: "✓",
    [DEBUG_FILTER.LOG]: "✎",
    [DEBUG_FILTER.WARN]: "⚠",
    [DEBUG_FILTER.ERROR]: "❌",
    [DEBUG_FILTER.FUDGE]: "🎲"
  };

  export type MapDebugTargetToDelegate = Map<DebugTarget, Function>;
  export interface MapDebugFilterToDelegate { [filter: number]: Function; }
}