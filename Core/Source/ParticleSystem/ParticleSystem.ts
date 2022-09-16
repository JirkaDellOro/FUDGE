namespace FudgeCore {
  
  export namespace ParticleData {

    export interface System {
      variables?: {[name: string]: Expression};
      color?: {r?: Expression, g?: Expression, b?: Expression, a?: Expression};
      mtxLocal?: Transformation[];
      mtxWorld?: Transformation[];
    }

    export type Recursive = System | System["variables"] | System["color"] | System["mtxLocal"] | Transformation | Expression;

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

    export function isExpression(_data: Recursive): _data is Expression {
      return isFunction(_data) || isVariable(_data) || isConstant(_data);
    }

    export function isFunction(_data: Recursive): _data is Function {
      return "function" in _data;
    }

    export function isVariable(_data: Recursive): _data is Variable {
      return "value" in _data && typeof _data.value == "string";
    }

    export function isConstant(_data: Recursive): _data is Constant {
      return "value" in _data && typeof _data.value == "number";
    }

    export function isTransformation(_data: Recursive): _data is Transformation {
      return "transformation" in _data;
    }
  }

  /**
   * Holds the information .
   * @authors Jonas Plotzky, HFU, 2020
   */
  export class ParticleSystem extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;
    
    #data: ParticleData.System;
    private shaderToShaderParticleSystem: Map<ShaderInterface, ShaderParticleSystem> = new Map();

    constructor(_name: string = ParticleSystem.name, _data: ParticleData.System = {}) {
      super();
      this.name = _name;
      this.data = _data;

      Project.register(this);
    }
    
    public get data(): ParticleData.System {
      return this.#data;
    }

    public set data(_data: ParticleData.System) {
      this.#data = _data;
      this.shaderToShaderParticleSystem.forEach(shader => shader.deleteProgram());
      this.shaderToShaderParticleSystem.clear();
    }

    public getShaderFrom(_source: ShaderInterface): ShaderParticleSystem {
      if (!this.shaderToShaderParticleSystem.has(_source)) {
        let particleShader: ShaderParticleSystem = new ShaderParticleSystem();
        particleShader.data = this.data;
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
      delete _mutator.cachedMutators;
      delete _mutator.shaderMap;
    }
    //#endregion
  }
}