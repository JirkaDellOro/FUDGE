"use strict";
var FileHandling;
(function (FileHandling) {
    window.addEventListener("load", handleLoad);
    let loadFunctions = {
        "FileReader": loadFilesWithFileReader,
        "Response": loadFilesWithResponse,
        "Fetch": loadFilesWithFetch
    };
    function handleLoad(_event) {
        console.log("Start");
        let input = document.querySelector("input[type='file']");
        input.addEventListener("change", handleFileSelect);
    }
    function handleFileSelect(_event) {
        let fileList = _event.target.files;
        if (fileList.length == 0)
            return;
        let load = loadFunctions[getLoader()];
        load(fileList);
    }
    function getLoader() {
        let formData = new FormData(document.forms[0]);
        return formData.get("Loader").toString();
    }
    function loadFilesWithFileReader(_fileList) {
        console.group("Load with FileReader");
        for (let file of _fileList) {
            console.log(file);
            let fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.addEventListener("load", handleFile);
        }
        console.groupEnd();
    }
    function handleFile(_event) {
        console.log(_event.target.result);
    }
    async function loadFilesWithResponse(_fileList) {
        console.group("Load with Response");
        for (let file of _fileList) {
            console.log(file);
            const data = await new Response(file).text();
            console.log(data);
        }
        console.groupEnd();
    }
    async function loadFilesWithFetch(_fileList) {
        console.group("Load with Fetch");
        try {
            for (let file of _fileList) {
                console.log(file);
                const data = await fetch(file.name);
                console.log(data);
            }
        }
        catch (_e) {
            console.error(_e);
        }
        console.groupEnd();
    }
})(FileHandling || (FileHandling = {}));
//# sourceMappingURL=File.js.map