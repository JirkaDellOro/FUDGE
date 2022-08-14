namespace FudgeCore {
  export interface MapFilenameToContent {
    [filename: string]: string;
  }
  /**
   * Handles file transfer from a FUDGE-Browserapp to the local filesystem without a local server.  
   * Saves to the download-path given by the browser, loads from the player's choice.
   */
  export class FileIoBrowserLocal extends EventTargetStatic {
    private static selector: HTMLInputElement;
    // TODO: refactor to async function to be handled using promise, instead of using event target
    public static async load(_multiple: boolean = false): Promise<MapFilenameToContent> {
      FileIoBrowserLocal.selector = document.createElement("input");
      FileIoBrowserLocal.selector.type = "file";
      FileIoBrowserLocal.selector.multiple = _multiple;
      FileIoBrowserLocal.selector.hidden = true;
      FileIoBrowserLocal.selector.addEventListener("change", FileIoBrowserLocal.handleFileSelect);
      document.body.appendChild(FileIoBrowserLocal.selector);

      return new Promise<MapFilenameToContent>(_resolve => {
        function hndLoaded(_event: Event): void {
          FileIoBrowserLocal.removeEventListener(EVENT.FILE_LOADED, hndLoaded);
          _resolve((<CustomEvent>_event).detail.mapFilenameToContent);
        }

        FileIoBrowserLocal.addEventListener(EVENT.FILE_LOADED, hndLoaded);
        FileIoBrowserLocal.selector.click();
      });
    }

    // TODO: refactor to async function to be handled using promise, instead of using event target
    public static save(_toSave: MapFilenameToContent, _type: string = "text/plain" ): Promise<MapFilenameToContent> {
      for (let filename in _toSave) {
        let content: string = _toSave[filename];
        let blob: Blob = new Blob([content], { type: _type });
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

      return new Promise<MapFilenameToContent>(_resolve => {
        _resolve(_toSave);
        // function hndSaved(_event: Event): void {
        //   FileIoBrowserLocal.removeEventListener(EVENT.FILE_SAVED, hndSaved);
        //   _resolve((<CustomEvent>_event).detail);
        // }

        // FileIoBrowserLocal.addEventListener(EVENT.FILE_SAVED, hndSaved);
        // let event: CustomEvent = new CustomEvent(EVENT.FILE_SAVED, { detail: { mapFilenameToContent: _toSave } });
        // FileIoBrowserLocal.targetStatic.dispatchEvent(event);
      });
    }

    public static async handleFileSelect(_event: Event): Promise<void> {
      Debug.fudge("-------------------------------- handleFileSelect");
      document.body.removeChild(FileIoBrowserLocal.selector);
      let fileList: FileList = (<HTMLInputElement>_event.target).files;
      Debug.fudge(fileList, fileList.length);
      if (fileList.length == 0)
        return;

      let loaded: MapFilenameToContent = {};
      await FileIoBrowserLocal.loadFiles(fileList, loaded);

      let event: CustomEvent = new CustomEvent(EVENT.FILE_LOADED, { detail: { mapFilenameToContent: loaded } });
      FileIoBrowserLocal.targetStatic.dispatchEvent(event);
    }

    public static async loadFiles(_fileList: FileList, _loaded: MapFilenameToContent): Promise<void> {
      for (let file of _fileList) {
        const content: string = await new Response(file).text();
        _loaded[file.name] = content;
      }
    }
  }
} 