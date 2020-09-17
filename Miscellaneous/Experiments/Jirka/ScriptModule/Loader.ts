import { Test } from "./Script.js";

console.log("Loader starts");
let filename: string = "./Script.js";
start();

async function start(): Promise<void> {
  try {
    let A: typeof import("./Script.js") = await import("./Script.js");
    // let A: typeof import(filename) = await import(filename);
    console.log(A.Test);
    let x: Test = new A.Test("Hallo");
    console.log(x.content);
  } catch (_error: unknown) {
    console.log(_error);
  }
}