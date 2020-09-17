console.log("Loader starts");
let filename = "./Script.js";
start();
async function start() {
    try {
        let A = await import("./Script.js");
        // let A: typeof import(filename) = await import(filename);
        console.log(A.Test);
        let x = new A.Test("Hallo");
        console.log(x.content);
    }
    catch (_error) {
        console.log(_error);
    }
}
export {};
//# sourceMappingURL=Loader.js.map