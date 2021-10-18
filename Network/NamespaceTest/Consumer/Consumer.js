// /<reference types="../../Build/Test"/>
// type nt = NamespaceTest;
//@ts-ignore
import { nt } from "../Build/Test.mjs";
console.log("Hallo");
let x = new nt.A();
x.test();
x.test();
