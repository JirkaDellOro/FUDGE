var NamespaceModule;
(function (NamespaceModule) {
    class ClassModule1 {
        constructor() {
            console.log(this.constructor.name, this);
        }
    }
    NamespaceModule.ClassModule1 = ClassModule1;
})(NamespaceModule || (NamespaceModule = {}));
//# sourceMappingURL=NamespaceModule1.js.map