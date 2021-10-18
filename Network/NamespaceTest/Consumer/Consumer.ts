// /<reference types="../../Build/Test"/>
// type nt = NamespaceTest;
//@ts-ignore
import {nt} from "../Build/Test.mjs";

console.log("Hallo");

let x: NamespaceTest.A = new nt.A();  
x.test();
x.test();
let y: NamespaceTest.A;