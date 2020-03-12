var MutatorTypes;
(function (MutatorTypes) {
    var ƒ = FudgeCore;
    let mesh = new ƒ.MeshQuad();
    let cmpMesh = new ƒ.ComponentMesh(mesh);
    let cmpMeshEmpty = new ƒ.ComponentMesh();
    show("Mesh referenced", cmpMesh);
    show("No reference", cmpMeshEmpty);
    function show(_groupName, _mutable) {
        let mutator;
        let types;
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
        if (typeof mutator.mesh == "object") {
            console.log("Attribute mesh refers to an instance of type", mutator.mesh.constructor.name);
            console.log("baseClass", mutator.mesh.constructor["baseClass"].name);
        }
        else {
            console.log("Attribute mesh refers to a class/function");
            for (let subclass of mutator.mesh["subclasses"])
                console.dir(subclass);
        }
        console.groupEnd();
    }
})(MutatorTypes || (MutatorTypes = {}));
//# sourceMappingURL=Mutator.js.map