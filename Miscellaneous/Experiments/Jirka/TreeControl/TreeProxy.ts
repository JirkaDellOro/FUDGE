// /<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  // import ƒ = FudgeCore;

  export abstract class TreeProxy<T> {
    public selection: Object[] = [];
    // TODO: stuff sources and target into one dragDrop-Object
    public dragSource: Object[] = [];
    public dropTarget: Object[] = [];
    
    public abstract getLabel(_object: T): string;
    public abstract hasChildren(_object: T): boolean;
    public abstract getChildren(_object: T): T[];
    public abstract rename(_object: T, _new: string): boolean;
    public abstract drop(_source: T[], _target: T): boolean;
  }
}