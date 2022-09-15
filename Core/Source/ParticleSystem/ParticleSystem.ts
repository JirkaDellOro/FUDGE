namespace FudgeCore {
  
  export namespace ParticleData {

    export interface Effect {
      variables: {[name: string]: Expression};
      color: {r?: Expression, g?: Expression, b?: Expression, a?: Expression};
      mtxLocal: Transformation[];
      mtxWorld: Transformation[];
    }

    export type EffectRecursive = Effect | Effect["variables"] | Effect["color"] | Effect["mtxLocal"] | Transformation | Expression;

    export type Expression = Function | Variable | Constant;

    export interface Function {
      function: FUNCTION;
      parameters: Expression[];
    }
  
    export interface Variable {
      value: string;
    }
  
    export interface Constant {
      value: number;
    }
  
    export interface Transformation {
      transformation: "translate" | "rotate" | "scale";
      x?: Expression;
      y?: Expression;
      z?: Expression;
    }

    export function isExpression(_effect: EffectRecursive): _effect is Expression {
      return isFunction(_effect) || isVariable(_effect) || isConstant(_effect);
    }

    export function isFunction(_effect: EffectRecursive): _effect is Function {
      return "function" in _effect;
    }

    export function isVariable(_effect: EffectRecursive): _effect is Variable {
      return "value" in _effect && typeof _effect.value == "string";
    }

    export function isConstant(_effect: EffectRecursive): _effect is Constant {
      return "value" in _effect && typeof _effect.value == "number";
    }

    export function isTransformation(_effect: EffectRecursive): _effect is Transformation {
      return "transformation" in _effect;
    }
  }

  /**
   * Holds the information .
   * @authors Jonas Plotzky, HFU, 2020
   */
  export class ParticleSystem extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;
    
    #effect: ParticleData.Effect;
    private shaderToShaderParticleSystem: Map<ShaderInterface, ShaderParticleSystem> = new Map();

    constructor(_name: string = ParticleSystem.name, _particleEffect: ParticleData.Effect = { variables: {}, mtxLocal: [], mtxWorld: [], color: {} }) {
      super();
      this.name = _name;
      this.effect = _particleEffect;

      Project.register(this);
    }
    
    public get effect(): ParticleData.Effect {
      return this.#effect;
    }

    public set effect(_effect: ParticleData.Effect) {
      this.#effect = _effect;
      this.shaderToShaderParticleSystem.forEach(shader => shader.deleteProgram());
      this.shaderToShaderParticleSystem.clear();
    }

    public getShaderFrom(_source: ShaderInterface): ShaderParticleSystem {
      if (!this.shaderToShaderParticleSystem.has(_source)) {
        let particleShader: ShaderParticleSystem = new ShaderParticleSystem();
        particleShader.particleSystem = this;
        particleShader.define.push(..._source.define);
        particleShader.vertexShaderSource = _source.getVertexShaderSource();
        particleShader.fragmentShaderSource = _source.getFragmentShaderSource();
        this.shaderToShaderParticleSystem.set(_source, particleShader);
      }
      
      return this.shaderToShaderParticleSystem.get(_source);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization =  {
        idResource: this.idResource,
        name: this.name,
        effect: this.effect
      };
      return serialization;
    }
    
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      this.effect = _serialization.effect;
      return this;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      return <MutatorForUserInterface>super.getMutator(); // remove data from mutator
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.effect = this.effect;
      return mutator;
    }
    
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.cachedMutators;
      delete _mutator.shaderMap;
    }
    //#endregion
  }
}