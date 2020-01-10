"use strict";
var FileHandling;
(function (FileHandling) {
    window.addEventListener("load", init);
    let loadFunctions = {
        "FileReader": loadFilesWithFileReader,
        "Response": loadFilesWithResponse,
        "Fetch": loadFilesWithFetch
    };
    let selector;
    let downloader;
    let filenameDisplay;
    let content;
    function init(_event) {
        console.log("Start");
        filenameDisplay = document.querySelector("input#Filename");
        content = document.querySelector("textarea");
        selector = document.createElement("input");
        selector.setAttribute("type", "file");
        selector.setAttribute("multiple", "true");
        selector.addEventListener("change", handleFileSelect);
        downloader = document.createElement("a");
        let buttons = document.querySelectorAll("button");
        for (let button of buttons)
            if (button.id == "Load")
                button.addEventListener("click", handleLoad);
            else
                button.addEventListener("click", handleSave);
    }
    function handleLoad(_event) {
        selector.click();
    }
    function handleSave(_event) {
        let blob = new Blob([content.value], { type: "text/plain" });
        let url = window.URL.createObjectURL(blob);
        //*/ using anchor element for download
        downloader.setAttribute("href", url);
        downloader.setAttribute("download", getFilenameDisplay());
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
        window.URL.revokeObjectURL(url);
        //*/
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
            logFile(file);
            let fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.addEventListener("load", handleFile);
        }
        console.groupEnd();
    }
    function handleFile(_event) {
        logContent(_event.target.result.toString());
    }
    async function loadFilesWithResponse(_fileList) {
        console.group("Load with Response");
        for (let file of _fileList) {
            logFile(file);
            const data = await new Response(file).text();
            logContent(data);
        }
        console.groupEnd();
    }
    async function loadFilesWithFetch(_fileList) {
        console.group("Load with Fetch");
        try {
            for (let file of _fileList) {
                logFile(file);
                const data = await fetch(file.name);
                const content = await data.text();
                logContent(content);
            }
        }
        catch (_e) {
            console.error(_e);
        }
        console.groupEnd();
    }
    function setFilenameDisplay(_name) {
        filenameDisplay.value = _name;
    }
    function getFilenameDisplay() {
        return filenameDisplay.value;
    }
    function logFile(_file) {
        setFilenameDisplay(_file.name);
        console.log(_file);
    }
    function logContent(_data) {
        content.value = _data;
        console.log(_data);
    }
})(FileHandling || (FileHandling = {}));
//# sourceMappingURL=File.js.map