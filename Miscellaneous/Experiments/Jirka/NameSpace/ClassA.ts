namespace NamespaceReflection {
    export function findNamespaceName(_namespace: Object): string {
        for (let prop in window)
            if (window[prop] == _namespace)
                return prop;
        return null;
        // @ts-ignore
    }

    export class ClassA {
        public static type: string = "ClassA in NamespaceReflection";
        // @ts-ignore
        public static args: Object = arguments;
        // @ts-ignore
        /// tslint:disable-next-line: variable-name
        private static ƒnamespace: string = findNamespaceName(arguments[0]);

        public static getNamespace(): string {
            return ClassA.ƒnamespace;
        }
    }
}