var genStruct;
(function (genStruct) {
    document.addEventListener("DOMContentLoaded", init);
    let crc;
    let mutator;
    function init() {
        let canvas = document.getElementsByTagName("canvas")[0];
        crc = canvas.getContext("2d");
        crc.strokeStyle = "#000";
        crc.lineWidth = 2;
        Scenes.createMiniScene();
        mutator = Scenes.node.cmpTransform.getMutatorForAnimation();
        Scenes.node.cmpTransform.getMutatorAttributeTypes(mutator);
        getObjectStructure(mutator);
    }
    function getObjectStructure(_obj) {
        for (let key in _obj) {
            let value = _obj[key];
            console.log(key, value);
            console.log(value instanceof Object);
            if (value instanceof Object)
                getObjectStructure(value);
        }
    }
})(genStruct || (genStruct = {}));
//# sourceMappingURL=generateStructure.js.map