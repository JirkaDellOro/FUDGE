
///<reference path="../View/View.ts"/>
///<reference path="../View/Resource/ViewExternal.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  interface DragDropFilter {
    onElementType: string;
    onComponentType: string;
    fromViews: (typeof View)[];
    ofType: Function;
    dropEffect: "copy" | "link" | "move" | "none";
  }

  let filter: { [name: string]: DragDropFilter } = {
    UrlOnTexture: { onElementType: "url", onComponentType: "TextureImage", fromViews: [ViewExternal], ofType: DirectoryEntry, dropEffect: "link" },
    UrlOnAudio: { onElementType: "url", onComponentType: "Audio", fromViews: [ViewExternal], ofType: DirectoryEntry, dropEffect: "link" }
  };

  export class ControllerComponent extends ƒui.Controller {
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener("input", this.mutateOnInput);
      this.domElement.addEventListener(ƒui.EVENT.DRAG_OVER, this.hndDragOver);
      this.domElement.addEventListener(ƒui.EVENT.DROP, this.hndDrop);
    }

    private hndDragOver = (_event: DragEvent): void => {
      // texture
      if (this.filterDragDrop(_event, filter.UrlOnTexture, checkMimeType(MIME.IMAGE)))
        return;

      // audio
      if (this.filterDragDrop(_event, filter.UrlOnAudio, checkMimeType(MIME.AUDIO)))
        return;

      function checkMimeType(_mime: MIME): (_sources: Object[]) => boolean {
        return (_sources: Object[]): boolean => {
          let sources: DirectoryEntry[] = <DirectoryEntry[]>_sources;
          return (sources.length == 1 && sources[0].getMimeType() == _mime);
        };
      }
    }

    private hndDrop = (_event: DragEvent): void => {
      let setExternalLink: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        let sources: DirectoryEntry[] = <DirectoryEntry[]>_sources;
        (<HTMLInputElement>_event.target).value = sources[0].pathRelative;
        this.mutable.addEventListener(ƒ.EVENT.DONE, (_event: Event) =>
          this.domElement.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }))
        );
        this.mutateOnInput(_event);
        return true;
      };

      // texture
      if (this.filterDragDrop(_event, filter.UrlOnTexture, setExternalLink))
        return;

      // audio
      if (this.filterDragDrop(_event, filter.UrlOnAudio, setExternalLink))
        return;

    }


    private filterDragDrop(_event: DragEvent, _filter: DragDropFilter, _callback: (_sources: Object[]) => boolean = () => true): boolean {
      let target: HTMLElement = <HTMLElement>_event.target;
      let typeElement: string = target.parentElement.getAttribute("key");
      let typeComponent: string = this.getComponentType(target);

      if (typeElement != _filter.onElementType || typeComponent != _filter.onComponentType)
        return false;

      let viewSource: View = View.getViewSource(_event);
      if (!_filter.fromViews.find((_view) => viewSource instanceof _view))
        return false;

      let sources: Object[] = viewSource.getDragDropSources();
      if (!(sources[0] instanceof _filter.ofType))
        return false;

      if (!_callback(sources))
        return false;

      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();

      return true;
    }

    private getComponentType(_target: HTMLElement): string {
      let element: HTMLElement = _target;
      while (element) {
        let type: string = element.getAttribute("type");
        if (type)
          return type;
        element = element.parentElement;
      }

      return undefined;
    }
  }
}