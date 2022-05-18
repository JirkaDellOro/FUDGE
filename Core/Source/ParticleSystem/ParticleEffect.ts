namespace FudgeCore {

  export enum PARTICLE_VARIBALE_NAMES {
    TIME = "time",
    INDEX = "index",
    SIZE = "size",
    RANDOM_NUMBERS = "randomNumbers"
  }

  /**
   * The data format used to store the parsed paticle effect
   */
  export interface ParticleEffectStructure {
    [attribute: string]: ParticleEffectStructure | Function;
  }

  /**
   * Holds all the information which defines the particle effect. Can load the said information out of a json file.
   * @authors Jonas Plotzky, HFU, 2020
   */
  export class ParticleEffect extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;

    public storageSystem: ParticleEffectStructure;
    public storageUpdate: ParticleEffectStructure;
    public storageParticle: ParticleEffectStructure;
    public mtxLocal: ParticleEffectStructure;
    public mtxWorld: ParticleEffectStructure;
    public componentMutators: ParticleEffectStructure;
    public cachedMutators: { [key: string]: Mutator };
    #data: ParticleEffectNode;

    constructor(_name: string = "ParticleEffect", _particleEffectNode: ParticleEffectNode = new ParticleEffectNodePath("root")) {
      super();
      this.name = _name;
      this.data = _particleEffectNode;

      Project.register(this);
    }

    /**
     * Parse the given effect data recursivley. The hierachy of the json file will be kept. Constants, variables("time") and functions definitions will be replaced with functions.
     * @param _data The particle effect data to parse recursivley.
     */
    private static parseData(_data: ParticleEffectNode, _variableNames: string[]): ParticleEffectStructure {
      if (!_data || !_variableNames) return {};

      let effectStructure: ParticleEffectStructure = {};
      
      for (const child of _data.children) {
        if (child instanceof ParticleEffectNodeFunction || child instanceof ParticleEffectNodeVariable)
          effectStructure[child.key] = this.parseClosure(child, _variableNames);
        else
          effectStructure[child.key] = this.parseData(child, _variableNames);
      }

      return effectStructure;
    }   

    /**
     * Parse the given closure data recursivley. Returns a function depending on the closure data.
     * @param _data The closure data to parse recursively.
     */
    private static parseClosure(_data: ParticleEffectNode, _variableNames: string[]): Function {
      if (_data instanceof ParticleEffectNodeFunction) {
        let parameters: Function[] = [];
        for (let param of _data.children) {
          parameters.push(this.parseClosure(param, _variableNames));
        }
        return ParticleClosureFactory.createClosure(_data.function, parameters);
      }

      if (_data instanceof ParticleEffectNodeVariable) {
        if (typeof _data.value == "string") {
          if (_variableNames.includes(_data.value)) {
            return function (_variables: ParticleVariables): number {
              // Debug.log("Variable", `"${_data}"`, _variables[<string>_data]);
              return <number>_variables[_data.value];
            };
          } else {
            throw `"${_data}" is not a defined variable in ${this.constructor.name} "${this.name}"`;
          }
        } 

        if (typeof _data.value == "number") {
          return function (_variables: ParticleVariables): number {
            // Debug.log("Constant", _data);
            return <number>_data.value;
          };
        }
      }

      throw `invalid node structure`;
    }

    /**
     * Creates entries in {@link variableNames} for each defined closure in _data. Predefined variables (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle effect data to parse.
     */
    private static preParseStorage(_data: ParticleEffectNode, _variableNames: string[]): string[] {
      for (const storagePartition of _data.children) {
        for (const variableDefinition of storagePartition.children) {
          let variableName: string = variableDefinition.key;
          if (_variableNames.includes(variableName)) {
            throw `"${variableName}" is already defined`;
          }
          else
            _variableNames.push(variableName);
        }
      }

      return _variableNames;
    }
    
    public get data(): ParticleEffectNode {
      return this.#data;
    }

    public set data(_data: ParticleEffectNode) {
      this.#data = _data;
      this.parse(_data);
    }
 
    /**
     * Asynchronously loads the json from the given url and parses it initializing this particle effect.
     */
    public async load(_url: RequestInfo): Promise<void> {
      if (!_url) return;

      let data: ParticleEffectNode = await window.fetch(_url)
        .then(_response => _response.json())
        .then(data => this.desirializeData(data));
      this.data = data;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization =  {
        idResource: this.idResource,
        name: this.name,
        data: this.serializeData(this.data)
      };
      return serialization;
    }
    
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      this.data = this.desirializeData(_serialization.data);
      return this;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      return <MutatorForUserInterface>super.getMutator();
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

    private serializeData(_data: ParticleEffectNode): Serialization {
      let serialization: Serialization = {};

      if (_data instanceof ParticleEffectNodeFunction) {
        serialization.function = _data.function;
        serialization.parameters = [];
      }

      for (const child of _data.children) {
        let childrenSerialization: Serialization = _data instanceof ParticleEffectNodeFunction ? serialization.parameters : serialization;
        if (child instanceof ParticleEffectNodeVariable)
          childrenSerialization[child.key] = child.value;
        else
          childrenSerialization[child.key] = this.serializeData(child);
      }

      return serialization;
    }

    private desirializeData(_serialization: Serialization, _key: string = "root"): ParticleEffectNode {
      let node: ParticleEffectNode;
      let isFunctionSerialization: boolean = "function" in _serialization || "parameters" in _serialization;

      node = isFunctionSerialization ? new ParticleEffectNodeFunction(_key, _serialization.function) : new ParticleEffectNodePath(_key);

      let childrenSerialization: Serialization = isFunctionSerialization ? _serialization.parameters : _serialization;
      for (const key in childrenSerialization) {
        node.addChild(
          typeof childrenSerialization[key] == "string" || typeof childrenSerialization[key] == "number" ? 
            new ParticleEffectNodeVariable(key, childrenSerialization[key]) : 
            this.desirializeData(childrenSerialization[key], key)
        );
      }

      return node;
    }
    //#endregion

    /**
     * Parses the data initializing this particle effect with the corresponding closures
     * @param _data The paticle effect data to parse.
     */
    private parse(_data: ParticleEffectNode): void {
      let variableNames: string[] = Object.values(PARTICLE_VARIBALE_NAMES);
      let dataStorage: ParticleEffectNode = _data.findChildByKey("storage");
      if (dataStorage) {
        variableNames = ParticleEffect.preParseStorage(dataStorage, variableNames);
        this.storageSystem = ParticleEffect.parseData(dataStorage.findChildByKey("system"), variableNames);
        this.storageUpdate = ParticleEffect.parseData(dataStorage.findChildByKey("update"), variableNames);
        this.storageParticle = ParticleEffect.parseData(dataStorage.findChildByKey("particle"), variableNames);
      }

      let dataTransform: ParticleEffectNode = _data.findChildByKey("transformations");
      if (dataTransform) {
        this.mtxLocal = ParticleEffect.parseData(dataTransform.findChildByKey("local"), variableNames);
        this.mtxWorld = ParticleEffect.parseData(dataTransform.findChildByKey("world"), variableNames);
      }
      
      let dataComponents: ParticleEffectNode = _data.findChildByKey("components");
      if (dataComponents) {
        this.componentMutators = ParticleEffect.parseData(dataComponents, variableNames);
      }

      this.cachedMutators = {};
      this.cacheMutators(this.mtxLocal);
      this.cacheMutators(this.mtxWorld);
      this.cacheMutators(this.componentMutators);
    }

    /**
     * Create mutators from the given _effectStructure and cache them.
     */
    private cacheMutators(_effectStructure: ParticleEffectStructure): void {
      for (const attribute in _effectStructure) {
        let effectStructureOrFunction: ParticleEffectStructure | Function = _effectStructure[attribute];
        if (effectStructureOrFunction instanceof Function) continue;

        this.cachedMutators[attribute] = this.createEmptyMutatorFrom(effectStructureOrFunction);
      }
    }

    /**
     * Create an empty mutator from _effectStructure.
     */
    private createEmptyMutatorFrom(_effectStructure: ParticleEffectStructure): Mutator {
      let mutator: Mutator = {};
      for (const attribute in _effectStructure) {
        let effectStructureOrFunction: ParticleEffectStructure | Function = _effectStructure[attribute];
        if (effectStructureOrFunction instanceof Function) {
          mutator[attribute] = null;
        } else {
          mutator[attribute] = this.createEmptyMutatorFrom(effectStructureOrFunction);
        }
      }
      return mutator;
    }
  }
}