var NamespaceModule;
(function (NamespaceModule) {
    class ClassModule2 {
        constructor() {
            console.log(this.constructor.name, this);
        }
    }
    NamespaceModule.ClassModule2 = ClassModule2;
})(NamespaceModule || (NamespaceModule = {}));
//# sourceMappingURL=NamespaceModule2.js.map