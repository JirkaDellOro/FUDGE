var TestSerializer;
(function (TestSerializer) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        Scenes.createMiniScene();
        let mutator = Scenes.node.getComponent(ƒ.ComponentMesh).getMutator();
        ƒ.Debug.log(mutator);
        let result = testSerialization(Scenes.node);
        console.group("Comparison");
        Compare.compare(Scenes.node, result);
        console.groupEnd();
    }
    function testSerialization(_object) {
        console.group("Original");
        console.log(_object);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.Serializer.serialize(_object);
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Stringified");
        let json = ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.group("Parsed");
        serialization = ƒ.Serializer.parse(json);
        console.log(serialization);
        console.groupEnd();
        console.group("Reconstructed");
        let reconstruction = ƒ.Serializer.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
        return reconstruction;
    }
})(TestSerializer || (TestSerializer = {}));
//# sourceMappingURL=Serializer.js.map