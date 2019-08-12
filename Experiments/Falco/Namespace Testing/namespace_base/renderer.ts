/// <reference path="NamespaceFile1.ts" />
// /// <reference path="./../namespace_secondary/NamespaceFile2.ts" />
/// <reference path="./../namespace_secondary/crap/namespaceTest.d.ts" />
let testClassFromOwnFolderFile = new OwnNameSpaceInFolder.namespaceTestClass();
testClassFromOwnFolderFile.testlog();

let class2 = new nsR.class2();
class2.testlog();

let class3 = new nsR.class3();
class3.testlog();
// let remoteTestClass = new RemoteNameSpace.remoteNamespaceTestClass();
// remoteTestClass.testlog();