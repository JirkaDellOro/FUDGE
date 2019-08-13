System.register(["./AssociatedClassesTest/index"], function (exports_1, context_1) {
    "use strict";
    var testStuff, aTest, bTest, cTest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (testStuff_1) {
                testStuff = testStuff_1;
            }
        ],
        execute: function () {
            aTest = new testStuff.a;
            aTest.a_speak();
            bTest = new testStuff.b();
            bTest.b_speak();
            cTest = new testStuff.c();
            cTest.c_speak();
        }
    };
});
