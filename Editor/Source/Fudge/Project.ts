namespace Fudge {
  enum PROJECT {
    OPT1 = "option1",
    OPT2 = "option2",
    OPT3 = "option3"
  }

  export class Project extends ƒ.Mutable {
    private title: string = "Fudge Project";
    private internalResourceFile: RequestInfo;
    private htmlProjectFile: RequestInfo;
    private scriptFile: RequestInfo;
    private graph: ƒ.Graph;
    private includePhysics: boolean = false;
    private option: PROJECT = PROJECT.OPT3;

    public constructor() {
      super();
    }

    public getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes {
      let types: ƒ.MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.option)
        types.option = PROJECT;
      return types;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }
}