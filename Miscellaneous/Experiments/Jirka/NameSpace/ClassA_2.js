var NamespaceReflection2;
(function (NamespaceReflection2) {
    NamespaceRegistrar.Registrar.registerNamespace(NamespaceReflection2);
    class ClassA {
    }
    ClassA.type = "ClassA in NamespaceReflection2";
    NamespaceReflection2.ClassA = ClassA;
    let NamespaceReflectionNested;
    (function (NamespaceReflectionNested) {
        NamespaceRegistrar.Registrar.registerNamespace(NamespaceReflectionNested);
        class ClassA {
        }
        ClassA.type = "ClassA in NamespaceReflectionNested";
        NamespaceReflectionNested.ClassA = ClassA;
    })(NamespaceReflectionNested = NamespaceReflection2.NamespaceReflectionNested || (NamespaceReflection2.NamespaceReflectionNested = {}));
})(NamespaceReflection2 || (NamespaceReflection2 = {}));
//# sourceMappingURL=ClassA_2.js.map