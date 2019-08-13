"use strict";
var OwnNameSpaceInFolder;
(function (OwnNameSpaceInFolder) {
    class namespaceTestClass {
        constructor() {
            console.log("constructed");
        }
        testlog() {
            console.log("log from file in own folder");
        }
    }
    OwnNameSpaceInFolder.namespaceTestClass = namespaceTestClass;
})(OwnNameSpaceInFolder || (OwnNameSpaceInFolder = {}));
