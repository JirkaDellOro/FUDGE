var ModuleWithLongName;
(function (ModuleWithLongName) {
    function sayHello() {
        console.log("Hi there, I'm a module with a very long name, but please call me 'ƒ'");
    }
    ModuleWithLongName.sayHello = sayHello;
})(ModuleWithLongName || (ModuleWithLongName = {}));
//# sourceMappingURL=ModuleWithLongName.js.map