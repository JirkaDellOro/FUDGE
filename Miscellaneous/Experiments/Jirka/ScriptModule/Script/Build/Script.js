var Test;
(function (Test) {
    console.log("Load Test0");
    //   export module ScriptModule {
    class Test0 {
        constructor(_content) {
            this.content = "default";
            console.log("Creating Test with ", _content);
            this.content = _content;
            console.log("Test0 knows ", Try);
        }
    }
    Test.Test0 = Test0;
})(Test || (Test = {}));
var Test;
(function (Test) {
    console.log("Load Test1");
    //   export module ScriptModule {
    class Test1 {
        constructor(_content) {
            this.content = "default";
            console.log("Creating Test with ", _content);
            this.content = _content;
            console.log("Test1 knows ", Try);
        }
    }
    Test.Test1 = Test1;
})(Test || (Test = {}));
var Try;
(function (Try_1) {
    console.log("Load Try");
    //   export module ScriptModule {
    class Try {
        constructor(_content) {
            this.content = "default";
            console.log("Creating Test with ", _content);
            this.content = _content;
            console.log("Try knows ", Test);
        }
    }
    Try_1.Try = Try;
})(Try || (Try = {}));
//# sourceMappingURL=Script.js.map