var MainNamespace;
(function (MainNamespace) {
    class ClassMain {
        constructor() {
            console.log(this.constructor.name, this);
        }
    }
    MainNamespace.ClassMain = ClassMain;
})(MainNamespace || (MainNamespace = {}));
//# sourceMappingURL=MainNamespace.js.map