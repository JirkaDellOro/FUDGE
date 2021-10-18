// /<reference types="../../Build/Test"/>
// type nt = NamespaceTest;
//@ts-ignore
import {nt} from "../Build/Test.mjs";
import n = NamespaceTest;

console.log("Hallo");

let x: n.A = new nt.A();  
x.test();
x.test();