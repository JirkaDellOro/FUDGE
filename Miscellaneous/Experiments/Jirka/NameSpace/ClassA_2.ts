namespace NamespaceReflection2 {
    NamespaceRegistrar.Registrar.registerNamespace(NamespaceReflection2);

    export class ClassA {
        public static type: string = "ClassA in NamespaceReflection2";
    }

    export namespace NamespaceReflectionNested {
        NamespaceRegistrar.Registrar.registerNamespace(NamespaceReflectionNested);
        export class ClassA {
            public static type: string = "ClassA in NamespaceReflectionNested";
        }
    }
}