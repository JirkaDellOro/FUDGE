
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
    UrlOnTexture: { onElementType: "url", onComponentType: "TextureImage", fromViews: [ViewExternal], ofType: DirectoryEntry, dropEffect: "link" }
  };

  export class ControllerComponent extends ƒui.Controller {
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener("input", this.mutateOnInput);
      this.domElement.addEventListener(ƒui.EVENT.DRAG_OVER, this.hndDragOver);
    }

    private hndDragOver = (_event: DragEvent): void => {

      this.filterDragDrop(_event, filter.UrlOnTexture, (_sources: Object[]): boolean => {
        let sources: DirectoryEntry[] = <DirectoryEntry[]>_sources;
        if (sources.length == 1 && !sources[0].isDirectory) {
          console.log(sources[0].pathRelative);
          console.log(sources[0].getMimeType());
          if (sources[0].getMimeType() == MIME.IMAGE)
            return true;
        }
        return false;
      });
    }

    private filterDragDrop(_event: DragEvent, _filter: DragDropFilter, _callback: (_sources: Object[]) => boolean): boolean {
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