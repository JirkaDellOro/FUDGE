var FileIo;
(function (FileIo) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let textarea;
    function init() {
        document.querySelector("button#Load").addEventListener("click", load);
        document.querySelector("button#Save").addEventListener("click", save);
        textarea = document.querySelector("textarea");
    }
    async function save() {
        let filename = document.querySelector("input").value;
        let map = { [filename]: textarea.value };
        ƒ.FileIoBrowserLocal.save(map);
    }
    async function load() {
        ƒ.FileIoBrowserLocal.addEventListener("fileLoaded" /* FILE_LOADED */, handleContentLoaded);
        ƒ.FileIoBrowserLocal.load();
    }
    function handleContentLoaded(_event) {
        let map = _event.detail.mapFilenameToContent;
        console.log("Map", map);
        textarea.value = "";
        for (let filename in map) {
            let content = map[filename];
            ƒ.FileIoBrowserLocal.removeEventListener("fileLoaded" /* FILE_LOADED */, handleContentLoaded);
            textarea.value += "------- " + filename + "----------\n";
            textarea.value += content;
            textarea.value += "\n";
        }
    }
})(FileIo || (FileIo = {}));
//# sourceMappingURL=FileIo.js.map