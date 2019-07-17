namespace FileHandling {
    window.addEventListener("load", handleLoad);
    let loadFunctions: { [key: string]: Function } = {
        "FileReader": loadFilesWithFileReader,
        "Response": loadFilesWithResponse,
        "Fetch": loadFilesWithFetch
    };

    function handleLoad(_event: Event): void {
        console.log("Start");
        let input: HTMLInputElement = document.querySelector("input[type='file']");
        input.addEventListener("change", handleFileSelect);
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
            console.log(file);
            let fileReader: FileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.addEventListener("load", handleFile);
        }
        console.groupEnd();
    }

    function handleFile(_event: Event): void {
        console.log((<FileReader>_event.target).result);
    }

    async function loadFilesWithResponse(_fileList: FileList): Promise<void> {
        console.group("Load with Response");
        for (let file of _fileList) {
            console.log(file);
            const data: string = await new Response(file).text();
            console.log(data);
        }
        console.groupEnd();
    }


    async function loadFilesWithFetch(_fileList: FileList): Promise<void> {
        console.group("Load with Fetch");
        try {
            for (let file of _fileList) {
                console.log(file);
                const data: Response = await fetch(file.name);
                console.log(data);
            }
        } catch (_e) {
            console.error(_e);
        }

        console.groupEnd();
    }
}   