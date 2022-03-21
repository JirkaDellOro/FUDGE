var FileIo;
(function (FileIo) {
    var ƒ = FudgeCore;
    ƒ.Serializer.registerNamespace(FileIo);
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        document.querySelector("button").addEventListener("click", handleStart);
    }
    async function handleStart() {
        let material = new ƒ.Material("Material_1", ƒ.ShaderFlat, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        // ƒ.Project.register(material);
        let mesh = new ƒ.MeshPyramid();
        // ƒ.Project.register(mesh);
        let node;
        node = Scenes.createCompleteMeshNode("Node", material, mesh);
        testFileIo(node);
    }
    async function testFileIo(_graph) {
        console.group("Original");
        console.log(_graph);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.Serializer.serialize(_graph);
        console.log(serialization);
        console.groupEnd();
        console.groupCollapsed("Stringified");
        let json = ƒ.Serializer.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.group("Save");
        let map = { "TestFileIo.ƒ": json };
        await ƒ.FileIoBrowserLocal.save(map);
        console.log(map);
        console.groupEnd();
        console.group("Load");
        ƒ.FileIoBrowserLocal.addEventListener("fileLoaded" /* FILE_LOADED */, handleLoad);
        await ƒ.FileIoBrowserLocal.load();
        console.groupEnd();
        async function handleLoad(_event) {
            map = _event.detail.mapFilenameToContent;
            console.log("Map", map);
            for (let filename in map) {
                let content = map[filename];
                ƒ.FileIoBrowserLocal.removeEventListener("fileLoaded" /* FILE_LOADED */, handleLoad);
                console.group("Parsed");
                let deserialization = ƒ.Serializer.parse(content);
                console.log(deserialization);
                console.groupEnd();
                console.group("Reconstructed");
                let reconstruction = await ƒ.Serializer.deserialize(serialization);
                console.log(reconstruction);
                console.groupEnd();
                console.group("Comparison");
                Compare.compare(_graph, reconstruction);
                console.groupEnd();
            }
        }
    }
})(FileIo || (FileIo = {}));
//# sourceMappingURL=FileIo.js.map