var IncludeFudge;
(function (IncludeFudge) {
    class ClassMain {
        constructor() {
            console.log(this.constructor.name, this);
        }
    }
    IncludeFudge.ClassMain = ClassMain;
})(IncludeFudge || (IncludeFudge = {}));
//# sourceMappingURL=IncludeFudge.js.map