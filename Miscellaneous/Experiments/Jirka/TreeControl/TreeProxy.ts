// /<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  // import ƒ = FudgeCore;

  export abstract class TreeProxy<T> {
    public selection: Object[] = [];
    
    public abstract getLabel(_object: T): string;
    public abstract hasChildren(_object: T): boolean;
    public abstract getChildren(_object: T): T[];
    public abstract rename(_object: T, _new: string): boolean;
  }
}