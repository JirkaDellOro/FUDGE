namespace MutatorTypes {
  import ƒ = FudgeCore;

  let mesh: ƒ.MeshQuad = new ƒ.MeshQuad();
  let cmpMesh: ƒ.Component = new ƒ.ComponentMesh(mesh);
  let cmpMeshEmpty: ƒ.Component = new ƒ.ComponentMesh();

  show("Mesh referenced", cmpMesh);
  show("No reference", cmpMeshEmpty);

  function show(_groupName: string, _mutable: ƒ.Mutable): void {
    let mutator: ƒ.MutatorForUserInterface;
    let types: ƒ.MutatorAttributeTypes;
    console.group(_groupName);
    mutator = _mutable.getMutatorForUserInterface();
    types = _mutable.getMutatorAttributeTypes(mutator);
    console.group("Instance");
    console.debug(cmpMesh);
    console.groupEnd();
    console.group("Mutator");
    console.debug(mutator);
    console.groupEnd();
    console.group("MutatorTypes");
    console.debug(types);
    console.groupEnd();

    if (typeof mutator.mesh == "object")
      console.log("Attribute mesh refers to an instance")
    else {
      console.log("Attribute mesh refers to a class/function")
      for (let subclass of <[]>mutator.mesh["subclasses"])
        console.dir(subclass);
    }

    console.log(mutator.mesh["subclasses"]);

    console.groupEnd();
  }
}