// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import * as testStuff from "./AssociatedClassesTest/index";

let aTest: testStuff.a = new testStuff.a;
aTest.a_speak();

let bTest: testStuff.b =  new testStuff.b();
bTest.b_speak();

let cTest: testStuff.c = new testStuff.c();
cTest.c_speak();