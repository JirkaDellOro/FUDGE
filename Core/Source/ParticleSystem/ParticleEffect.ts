namespace FudgeCore {
  
  export namespace ParticleData {

    export interface Effect {
      variables?: {[name: string]: Expression};
      color?: {r?: Expression, g?: Expression, b?: Expression, a?: Expression};
      mtxLocal?: Transformation[];
      mtxWorld?: Transformation[];
    }

    export type EffectRecursive = Effect | Effect["variables"] | Effect["color"] | Effect["mtxLocal"] | Transformation | Expression;

    export type Expression = Function | Variable | Constant;

    export interface Function {
      function: FUNCTION;
      parameters: Expression[];
      readonly type: "function";
    }
  
    export interface Variable {
      name: string;
      type: "variable";
    }
  
    export interface Constant {
      value: number;
      type: "constant";
    }
  
    export interface Transformation {
      transformation: "translate" | "rotate" | "scale";
      x?: Expression;
      y?: Expression;
      z?: Expression;
      readonly type: "transformation";
    }

    export function isExpression(_data: General): _data is Expression {
      return isFunction(_data) || isVariable(_data) || isConstant(_data);
    }

    export function isFunction(_data: General): _data is Function {
      return (_data as Function)?.type == "function";
    }

    export function isVariable(_data: General): _data is Variable {
      return (_data as Variable)?.type == "variable";
    }

    export function isConstant(_data: General): _data is Constant {
      return (_data as Constant)?.type == "constant";
    }

    export function isTransformation(_data: General): _data is Transformation {
      return (_data as Transformation)?.type == "transformation";
    }
  }

  /**
   * Holds all the information which defines the particle effect. Can load the said information out of a json file.
   * @authors Jonas Plotzky, HFU, 2020
   */
  export class ParticleEffect extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;
    public cachedMutators: { [key: string]: Mutator };
    
    #data: ParticleData.Effect;
    private shaderMap: Map<ShaderInterface, ShaderParticleSystem> = new Map();

    constructor(_name: string = "ParticleEffect", _particleEffectData: ParticleData.Effect = {}) {
      super();
      this.name = _name;
      this.data = _particleEffectData;

      Project.register(this);
    }
    
    public get data(): ParticleData.Effect {
      return this.#data;
    }

    public set data(_data: ParticleData.Effect) {
      this.#data = _data;
      this.shaderMap.forEach( shader => shader.deleteProgram() );
      this.shaderMap.clear();
    }

    public getShaderFrom(_source: ShaderInterface): ShaderParticleSystem {
      if (!this.shaderMap.has(_source)) {
        let particleShader: ShaderParticleSystem = new ShaderParticleSystem();
        particleShader.particleEffect = this;
        particleShader.define.push(..._source.define);
        particleShader.vertexShaderSource = _source.getVertexShaderSource();
        particleShader.fragmentShaderSource = _source.getFragmentShaderSource();
        this.shaderMap.set(_source, particleShader);
      }
      
      return this.shaderMap.get(_source);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization =  {
        idResource: this.idResource,
        name: this.name,
        data: this.data
      };
      return serialization;
    }
    
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      this.data = _serialization.data;
      return this;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      return <MutatorForUserInterface>super.getMutator(); // remove data from mutator
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.data = this.data;
      return mutator;
    }
    
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.storageSystem;
      delete _mutator.storageUpdate;
      delete _mutator.storageParticle;
      delete _mutator.transformLocal;
      delete _mutator.transformWorld;
      delete _mutator.componentMutations;
      delete _mutator.cachedMutators;
      delete _mutator.definedVariables;
    }
    //#endregion
  }
}