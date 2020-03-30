// /<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  // import ƒ = FudgeCore;

  export abstract class TreeProxy<T> {
    public abstract getLabel(_object: T): string;
    public abstract hasChildren(_object: T): boolean;
    public abstract getChildren(_object: T): T[];
  }
}