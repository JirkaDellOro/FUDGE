namespace FudgeCore {

  /**
   * The tree data structure that contains the information which properties of a particle get mutated and how to build the closures to mutate said property.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export abstract class ParticleEffectNode {
    public key: string;
    public parent: ParticleEffectNode;
    public children: ParticleEffectNode[] = [];

    public constructor(_key: string) {
      this.key = _key;
    }

    public addChild(_child: ParticleEffectNode): void {
      if (!this.isDescendantOf(_child)) {
        this.children.push(_child);
        _child.parent = this;
      }
    }

    public isDescendantOf(_ancestor: ParticleEffectNode): boolean {
      let node: ParticleEffectNode = this;
      while (node && node != _ancestor)
        node = node == node.parent ? null : node.parent;
      return (node != null);
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

    public findChildByKey(_key: string): ParticleEffectNode {
      return this.children.find((child) => child.key == _key);
    }
  }

  /**
   * Part of the data structure that defines the particle effect (see {@link ParticleEffectNode}). Resembles a path to a property which will get mutated.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class ParticleEffectNodePath extends ParticleEffectNode {
    // public children: ParticleEffectNode[] = [];

  }

  /**
   * Part of the data structure that defines the particle effect (see {@link ParticleEffectNode}). Resembles a definition of a closure used to mutate a property.
   * @authors Jonas Plotzky, HFU, 2022
   */  
  export class ParticleEffectNodeFunction extends ParticleEffectNode {
    public function: string;
    // public children: (ParticleEffectFunctionNode | ParticleEffectVariableNode)[] = [];

    public constructor(_key: string, _function: string) {
      super(_key);
      this.function = _function;
    }
  }


  /**
   * Part of the data structure that defines the particle effect (see {@link ParticleEffectNode}). Resembles a variable or constant used as an input for a closure.
   * @authors Jonas Plotzky, HFU, 2022
   */  
  export class ParticleEffectNodeVariable extends ParticleEffectNode {
    public value: string | number;

    public constructor(_key: string, _value: string | number) {
      super(_key);
      this.value = _value;
    }
  }
}