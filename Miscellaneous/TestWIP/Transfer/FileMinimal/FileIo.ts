namespace FileIo {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);
  let textarea: HTMLTextAreaElement;

  function init(): void {
    document.querySelector("button#Load").addEventListener("click", load);
    document.querySelector("button#Save").addEventListener("click", save);
    textarea = document.querySelector("textarea");
  }

  async function save(): Promise<void> {
    let filename: string = document.querySelector("input").value;
    let map: ƒ.MapFilenameToContent = { [filename]: textarea.value };
    ƒ.FileIoBrowserLocal.save(map);
  }

  async function load(): Promise<void> {
    ƒ.FileIoBrowserLocal.addEventListener(ƒ.EVENT.FILE_LOADED, handleContentLoaded);
    ƒ.FileIoBrowserLocal.load();
  }


  function handleContentLoaded(_event: CustomEvent): void {
    let map: ƒ.MapFilenameToContent = _event.detail.mapFilenameToContent;
    console.log("Map", map);
    textarea.value = "";
    for (let filename in map) {
      let content: string = map[filename];
      ƒ.FileIoBrowserLocal.removeEventListener(ƒ.EVENT.FILE_LOADED, handleContentLoaded);
      textarea.value += "------- " + filename + "----------\n";
      textarea.value += content;
      textarea.value += "\n";
    }
  }
}