namespace Fudge {
    export interface MapFilenameToContent {
        [filename: string]: string;
    }
    /**
     * Handles file transfer from a Fudge-Browserapp to the local filesystem without a local server.  
     * Saves to the download-path given by the browser, loads from the player's choice.
     */
    export class FileIoBrowserLocal extends EventTargetStatic {
        // TODO: refactor to async function to be handled using promise, instead of using event target
        public static load(): void {
            let selector: HTMLInputElement;
            selector = document.createElement("input");
            selector.setAttribute("type", "file");
            selector.setAttribute("multiple", "true");
            selector.addEventListener("change", FileIoBrowserLocal.handleFileSelect);
            selector.click();
        }

        // TODO: refactor to async function to be handled using promise, instead of using event target
        public static save(_toSave: MapFilenameToContent): void {
            for (let filename in _toSave) {
                let content: string = _toSave[filename];
                let blob: Blob = new Blob([content], { type: "text/plain" });
                let url: string = window.URL.createObjectURL(blob);
                //*/ using anchor element for download
                let downloader: HTMLAnchorElement;
                downloader = document.createElement("a");
                downloader.setAttribute("href", url);
                downloader.setAttribute("download", filename);
                document.body.appendChild(downloader);
                downloader.click();
                document.body.removeChild(downloader);
                window.URL.revokeObjectURL(url);
            }

            let event: CustomEvent = new CustomEvent(EVENT.FILE_SAVED, { detail: { mapFilenameToContent: _toSave } });
            FileIoBrowserLocal.targetStatic.dispatchEvent(event);
        }

        public static async handleFileSelect(_event: Event): Promise<void> {
            let fileList: FileList = (<HTMLInputElement>_event.target).files;
            if (fileList.length == 0)
                return;

            let loaded: MapFilenameToContent = {};
            await FileIoBrowserLocal.loadFiles(fileList, loaded);

            let event: CustomEvent = new CustomEvent(EVENT.FILE_LOADED, { detail: { mapFilenameToContent: loaded } });
            FileIoBrowserLocal.targetStatic.dispatchEvent(event);
        }

        public static async loadFiles(_fileList: FileList, _loaded: MapFilenameToContent): Promise<void> {
            for (let filename in _fileList) {
                let file: File = _fileList[filename];
                const content: string = await new Response(file).text();
                _loaded[filename] = content;
            }
        }
    }
}