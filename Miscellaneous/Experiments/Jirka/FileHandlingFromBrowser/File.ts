namespace FileHandling {
    window.addEventListener("load", init);
    let loadFunctions: { [key: string]: Function } = {
        "FileReader": loadFilesWithFileReader,
        "Response": loadFilesWithResponse,
        "Fetch": loadFilesWithFetch
    };

    let selector: HTMLInputElement;
    let downloader: HTMLAnchorElement;
    let filenameDisplay: HTMLInputElement;
    let content: HTMLTextAreaElement;

    function init(_event: Event): void {
        console.log("Start");
        filenameDisplay = document.querySelector("input#Filename");
        content = document.querySelector("textarea");

        selector = document.createElement("input");
        selector.setAttribute("type", "file");
        selector.setAttribute("multiple", "true");
        selector.addEventListener("change", handleFileSelect);

        downloader = document.createElement("a");

        let buttons: NodeListOf<HTMLButtonElement> = document.querySelectorAll("button");
        for (let button of buttons)
            if (button.id == "Load")
                button.addEventListener("click", handleLoad);
            else
                button.addEventListener("click", handleSave);
    }

    function handleLoad(_event: Event): void {
        selector.click();
    }

    function handleSave(_event: Event): void {
        let blob: Blob = new Blob([content.value], { type: "text/plain" });
        let url: string = window.URL.createObjectURL(blob);
        //*/ using anchor element for download
        downloader.setAttribute("href", url);
        downloader.setAttribute("download", getFilenameDisplay());
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
        window.URL.revokeObjectURL(url);
        //*/
    }

    function handleFileSelect(_event: Event): void {
        let fileList: FileList = (<HTMLInputElement>_event.target).files;
        if (fileList.length == 0)
            return;

        let load: Function = loadFunctions[getLoader()];
        load(fileList);
    }

    function getLoader(): string {
        let formData: FormData = new FormData(document.forms[0]);
        return formData.get("Loader").toString();
    }

    function loadFilesWithFileReader(_fileList: FileList): void {
        console.group("Load with FileReader");
        for (let file of _fileList) {
            logFile(file);
            let fileReader: FileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.addEventListener("load", handleFile);
        }
        console.groupEnd();
    }

    function handleFile(_event: Event): void {
        logContent((<FileReader>_event.target).result.toString());
    }

    async function loadFilesWithResponse(_fileList: FileList): Promise<void> {
        console.group("Load with Response");
        for (let file of _fileList) {
            logFile(file);
            const data: string = await new Response(file).text();
            logContent(data);
        }
        console.groupEnd();
    }


    async function loadFilesWithFetch(_fileList: FileList): Promise<void> {
        console.group("Load with Fetch");
        try {
            for (let file of _fileList) {
                logFile(file);
                const data: Response = await fetch(file.name);
                const content: string = await data.text();
                logContent(content);
            }
        } catch (_e) {
            console.error(_e);
        }

        console.groupEnd();
    }

    function setFilenameDisplay(_name: string): void {
        filenameDisplay.value = _name;
    }
    function getFilenameDisplay(): string {
        return filenameDisplay.value;
    }

    function logFile(_file: File): void {
        setFilenameDisplay(_file.name);
        console.log(_file);
    }
    function logContent(_data: string): void {
        content.value = _data;
        console.log(_data);
    }
}   