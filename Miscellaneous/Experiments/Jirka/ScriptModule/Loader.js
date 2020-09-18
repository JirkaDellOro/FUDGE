var Loader;
(function (Loader) {
    console.log("Loader starts");
    start();
    async function start() {
        try {
            let test0 = new Test.Test0("Hallo");
            let try0 = new Try.Try("Hallo");
        }
        catch (_error) {
            console.log(_error);
        }
    }
})(Loader || (Loader = {}));
//# sourceMappingURL=Loader.js.map