namespace FudgeCore {

  /**
   * The tree data structure that contains the information which properties of a particle get mutated and how to build the closures to mutate said property.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export abstract class ParticleEffectNode {
    public parent: ParticleEffectNodePath | ParticleEffectNodeFunction = null;
    public abstract children: ParticleEffectNode[];

    public get key(): string | number  {
      if (!this.parent) return "root";
      return this.parent.findChild(this);
    }

    public isDescendantOf(_ancestor: ParticleEffectNode): boolean {
      let node: ParticleEffectNode = this;
      while (node && node != _ancestor)
        node = node.parent;
      return (node != null);
    }
  }

  /**
   * Part of the data structure that defines the particle effect (see {@link ParticleEffectNode}). Resembles a path to a property which will get mutated.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class ParticleEffectNodePath extends ParticleEffectNode {
    public override parent: ParticleEffectNodePath;
    public properties: {[key: string]: ParticleEffectNode} = {};
    
    public get children(): ParticleEffectNode[] {
      return Object.values(this.properties);
    }
    
    public addChild(_child: ParticleEffectNode, _key: string): void {
      let previousParent: ParticleEffectNodePath | ParticleEffectNodeFunction = _child.parent;
      if (previousParent) {
        previousParent.removeChild(_child);
      }

      if (!this.isDescendantOf(_child)) {
        this.properties[_key] = _child;
        _child.parent = this;
      }
    }

    public removeChild(_child: ParticleEffectNode): void {
      let found: string = this.findChild(_child);
      if (!found)
        return;

      delete this.properties[found];
      _child.parent = null;
    }

    public findChild(_search: ParticleEffectNode): string {
      return Object.entries(this.properties).find(pair => pair[1] == _search)[0];
    }
  }

  /**
   * Part of the data structure that defines the particle effect (see {@link ParticleEffectNode}). Resembles a definition of a closure used to mutate a property.
   * @authors Jonas Plotzky, HFU, 2022
   */  
  export class ParticleEffectNodeFunction extends ParticleEffectNode {
    public function: string;
    public children: ParticleEffectNode[] = [];

    public constructor(_function: string) {
      super();
      this.function = _function;
    }

    public addChild(_child: ParticleEffectNode): void {
      let previousParent: ParticleEffectNodePath | ParticleEffectNodeFunction = _child.parent;
      if (previousParent)
        previousParent.removeChild(_child);

      if (!this.isDescendantOf(_child) && !this.children.includes(_child)) {
        this.children.push(_child);
        _child.parent = this;
      }
    }

    public removeChild(_child: ParticleEffectNode): void {
      let found: number = this.findChild(_child);
      if (found < 0)
        return;

      this.children.splice(found, 1);
      _child.parent = null;
    }

    public findChild(_search: ParticleEffectNode): number {
      return this.children.indexOf(_search);
    }
  }


  /**
   * Part of the data structure that defines the particle effect (see {@link ParticleEffectNode}). Resembles a variable or constant used as an input for a closure.
   * @authors Jonas Plotzky, HFU, 2022
   */  
  export class ParticleEffectNodeVariable extends ParticleEffectNode {
    public value: string | number;

    public constructor(_value: string | number) {
      super();
      this.value = _value;
    }

    public get children(): ParticleEffectNode[] {
      return [];
    }
  }
}