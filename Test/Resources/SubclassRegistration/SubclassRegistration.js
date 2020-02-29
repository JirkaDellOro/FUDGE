var SubclassRegistration;
(function (SubclassRegistration) {
    var ƒ = FudgeCore;
    console.group("Mesh");
    for (let subclass of ƒ.Mesh.subclasses)
        console.dir(subclass);
    console.groupEnd();
    console.group("Component");
    for (let subclass of ƒ.Component.subclasses)
        console.dir(subclass);
    console.groupEnd();
    console.group("Shader");
    for (let subclass of ƒ.Shader.subclasses)
        console.dir(subclass);
    console.groupEnd();
})(SubclassRegistration || (SubclassRegistration = {}));
//# sourceMappingURL=SubclassRegistration.js.map