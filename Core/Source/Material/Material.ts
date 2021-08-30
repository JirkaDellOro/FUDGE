namespace FudgeCore {
  /**
   * Baseclass for materials. Combines a {@link Shader} with a compatible {@link Coat}
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Material extends Mutable implements SerializableResource {
    /** The name to call the Material by. */
    public name: string;
    public idResource: string = undefined;
    private shaderType: typeof Shader; // The shader program used by this BaseMaterial
    private coat: Coat;

    public constructor(_name: string, _shader?: typeof Shader, _coat?: Coat) {
      super();
      this.name = _name;
      this.shaderType = _shader;
      if (_shader) {
        if (_coat)
          this.setCoat(_coat);
        else
          this.setCoat(this.createCoatMatchingShader());
      }
      Project.register(this);
    }

    /**
     * Creates a new {@link Coat} instance that is valid for the {@link Shader} referenced by this material
     */
    public createCoatMatchingShader(): Coat {
      let coat: Coat = new (this.shaderType.getCoat())();
      return coat;
    }

    /**
     * Makes this material reference the given {@link Coat} if it is compatible with the referenced {@link Shader}
     * @param _coat 
     */
    public setCoat(_coat: Coat): void {
      if (_coat.constructor != this.shaderType.getCoat())
        if (_coat instanceof this.shaderType.getCoat())
          Debug.fudge("Coat is extension of Coat required by shader");
        else
          throw (new Error("Shader and coat don't match"));
      this.coat = _coat;
    }

    /**
     * Returns the currently referenced {@link Coat} instance
     */
    public getCoat(): Coat {
      return this.coat;
    }

    /**
     * Changes the materials reference to the given {@link Shader}, creates and references a new {@link Coat} instance  
     * and mutates the new coat to preserve matching properties.
     * @param _shaderType 
     */
    public setShader(_shaderType: typeof Shader): void {
      this.shaderType = _shaderType;
      let coat: Coat = this.createCoatMatchingShader();
      coat.mutate(this.coat.getMutator());
      this.setCoat(coat);
    }

    /**
     * Returns the {@link Shader} referenced by this material
     */
    public getShader(): typeof Shader {
      return this.shaderType;
    }


    //#region Transfer
    // TODO: this type of serialization was implemented for implicit Material create. Check if obsolete when only one material class exists and/or materials are stored separately
    public serialize(): Serialization {
      let serialization: Serialization = {
        name: this.name,
        idResource: this.idResource,
        shader: this.shaderType.name,
        coat: Serializer.serialize(this.coat)
      };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.name = _serialization.name;
      Project.register(this, _serialization.idResource);
      // this.idResource = _serialization.idResource;
      // TODO: provide for shaders in the users namespace. See Serializer fullpath etc.
      // tslint:disable-next-line: no-any
      this.shaderType = (<any>FudgeCore)[_serialization.shader];
      let coat: Coat = await <Promise<Coat>>Serializer.deserialize(_serialization.coat);
      this.setCoat(coat);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      // delete _mutator.idResource;
    }
    //#endregion
  }
}