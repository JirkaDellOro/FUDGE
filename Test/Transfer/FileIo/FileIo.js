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
        // ƒ.ResourceManager.register(material);
        let mesh = new ƒ.MeshPyramid();
        // ƒ.ResourceManager.register(mesh);
        let node;
        node = Scenes.createCompleteMeshNode("Node", material, mesh);
        // let nodeResource: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(node);
        // let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(nodeResource);
        // ƒ.Debug.log(instance);
        // let result: ƒ.Resources = testFileIo(node);
        testFileIo(node);
    }
    async function testFileIo(_branch) {
        console.group("Original");
        console.log(_branch);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.Serializer.serialize(_branch);
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
        function handleLoad(_event) {
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
                let reconstruction = ƒ.Serializer.deserialize(serialization);
                console.log(reconstruction);
                console.groupEnd();
                console.group("Comparison");
                Compare.compare(_branch, reconstruction);
                console.groupEnd();
            }
        }
    }
})(FileIo || (FileIo = {}));
//# sourceMappingURL=FileIo.js.map