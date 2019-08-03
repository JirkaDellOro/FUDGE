///<reference path="Main.ts"/>
namespace NamespaceReflection {
    NamespaceRegistrar.Registrar.registerNamespace(NamespaceReflection);

    function reflectNamespaceOnProperty(_constructor: Function, _name: string, _args: Object): void {
        console.dir(_constructor, _name, _args);
        console.dir(arguments);
    }

    export class ClassC {
        // @ts-ignore
        @reflectNamespaceOnProperty(arguments)
        private static ƒnamespace: string;

        public static getNamespace(): string {
            return ClassC.ƒnamespace;
        }
    }
}