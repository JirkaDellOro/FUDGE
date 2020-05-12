"use strict";
var Import;
(function (Import) {
    test();
    function test() {
        console.log(Import.data);
        let storedValues = {
            "time": 0.5,
            "index": 0,
            "size": 1
        };
        let randomNumbers = [42];
        let effectImporter = new Import.ParticleEffectImporter();
        effectImporter.randomNumbers = randomNumbers;
        effectImporter.storedValues = storedValues;
        let effect = effectImporter.parseFile(Import.data);
        // evaluate storage
        for (const key in effect.storage) {
            console.groupCollapsed(`Evaluate storage "${key}"`);
            storedValues[key] = effect.storage[key]();
            console.log(`Stored "${key}"`, storedValues[key]);
            console.groupEnd();
        }
        //evaluate translation
        for (const key in effect.translation) {
            console.groupCollapsed(`Evaluate translation "${key}"`);
            storedValues[key] = effect.translation[key]();
            // console.log(`Stored "${key}"`, storedValues[key]);
            console.groupEnd();
        }
    }
})(Import || (Import = {}));
//# sourceMappingURL=Test.js.map