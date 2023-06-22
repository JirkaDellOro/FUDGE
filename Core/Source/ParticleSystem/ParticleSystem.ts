namespace FudgeCore {
  
  /**
   * The namesapce for handling the particle data
   */
  export namespace ParticleData {

    export interface System {
      variableNames?: string[];
      variables?: Expression[]; //{ [name: string]: Expression };
      color?: Expression[];
      mtxLocal?: Transformation[];
      mtxWorld?: Transformation[];
    }
    
    export type Recursive = System | Expression[] | Transformation[] | Transformation | Expression;

    export type Expression = Function | Variable | Constant | Code;

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

    export interface Code {
      code: string;
    }
  
    export interface Transformation {
      transformation: "translate" | "rotate" | "scale";
      parameters: Expression[];
    }

    export function isExpression(_data: Recursive): _data is Expression {
      return isFunction(_data) || isVariable(_data) || isConstant(_data) || isCode(_data);
    }

    export function isFunction(_data: Recursive): _data is Function {
      return typeof _data == "object" && "function" in _data;
    }

    export function isVariable(_data: Recursive): _data is Variable {
      return typeof _data == "object" && "value" in _data && typeof _data.value == "string";
    }

    export function isConstant(_data: Recursive): _data is Constant {
      return typeof _data == "object" && "value" in _data && typeof _data.value == "number";
    }

    export function isCode(_data: Recursive): _data is Code {
      return typeof _data == "object" && "code" in _data;
    }

    export function isTransformation(_data: Recursive): _data is Transformation {
      return typeof _data == "object" && "transformation" in _data;
    }
  }

  /**
   * Holds information on how to mutate the particles of a particle system.
   * A full particle system is composed by attaching a {@link ComponentParticleSystem}, {@link ComponentMesh} and {@link ComponentMaterial} to the same {@link Node}. 
   * Additionally a {@link ComponentFaceCamera} can be attached to make the particles face the camera.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class ParticleSystem extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;
    
    #data: ParticleData.System;
    /** Map of shader universal derivates to corresponding computed {@link ShaderParticleSystem}. 
     * This way each particle system resource can be used in conjunction with all shader universal derivates */
    #shaderToShaderParticleSystem: Map<ShaderInterface, ShaderParticleSystem> = new Map();

    public constructor(_name: string = ParticleSystem.name, _data: ParticleData.System = {}) {
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
      this.#shaderToShaderParticleSystem.forEach(_shader => _shader.deleteProgram());
      this.#shaderToShaderParticleSystem.clear();
    }

    /**
     * Returns a corresponding {@link ShaderParticleSystem} for the given shader universal derivate.
     * @param _source the shader universal derivate to use as a base for the particle system
     * @returns the corresponding {@link ShaderParticleSystem}
     */
    public getShaderFrom(_source: ShaderInterface): ShaderParticleSystem {
      if (!this.#shaderToShaderParticleSystem.has(_source)) {
        let particleShader: ShaderParticleSystem = new ShaderParticleSystem();
        particleShader.data = this.data;
        particleShader.define = [...particleShader.define, ..._source.define];
        particleShader.vertexShaderSource = _source.getVertexShaderSource();
        particleShader.fragmentShaderSource = _source.getFragmentShaderSource();
        this.#shaderToShaderParticleSystem.set(_source, particleShader);
      }
      
      return this.#shaderToShaderParticleSystem.get(_source);
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