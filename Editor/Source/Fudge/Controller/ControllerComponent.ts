
///<reference path="../View/View.ts"/>
///<reference path="../View/Resource/ViewExternal.ts"/>
///<reference path="../View/Resource/ViewInternal.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  interface DragDropFilter {
    onKeyAttribute?: string;
    onTypeAttribute?: string;
    fromViews?: (typeof View)[];
    onType?: Function;
    ofType?: Function;
    dropEffect: "copy" | "link" | "move" | "none";
  }

  let filter: { [name: string]: DragDropFilter } = {
    UrlOnTexture: { fromViews: [ViewExternal], onKeyAttribute: "url", onTypeAttribute: "TextureImage", ofType: DirectoryEntry, dropEffect: "link" },
    UrlOnAudio: { fromViews: [ViewExternal], onKeyAttribute: "url", onTypeAttribute: "Audio", ofType: DirectoryEntry, dropEffect: "link" },
    MaterialOnComponentMaterial: { fromViews: [ViewInternal], onTypeAttribute: "Material", onType: ƒ.ComponentMaterial, ofType: ƒ.Material, dropEffect: "link" },
    MeshOnComponentMesh: { fromViews: [ViewInternal], onType: ƒ.ComponentMesh, ofType: ƒ.Mesh, dropEffect: "link" }
  };

  export class ControllerComponent extends ƒui.Controller {
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener("input", this.mutateOnInput);
      this.domElement.addEventListener(ƒui.EVENT.DRAG_OVER, this.hndDragOver);
      this.domElement.addEventListener(ƒui.EVENT.DROP, this.hndDrop);
    }

    private hndDragOver = (_event: DragEvent): void => {
      // url on texture
      if (this.filterDragDrop(_event, filter.UrlOnTexture, checkMimeType(MIME.IMAGE))) return;
      // url on audio
      if (this.filterDragDrop(_event, filter.UrlOnAudio, checkMimeType(MIME.AUDIO))) return;

      // Material on ComponentMaterial
      if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial)) return;
      // Mesh on ComponentMesh
      if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, (_sources: Object[]) => {
        let key: string = this.getAncestorWithType(_event.target).getAttribute("key");
        return (key == "mesh");
      })) return;

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
        this.mutateOnInput(_event);
        return true;
      };
      let setResource: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        let ancestor: HTMLElement = this.getAncestorWithType(_event.target);
        let key: string = ancestor.getAttribute("key");
        this.mutable[key] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
        return true;
      };

      // texture
      if (this.filterDragDrop(_event, filter.UrlOnTexture, setExternalLink)) return;
      // audio
      if (this.filterDragDrop(_event, filter.UrlOnAudio, setExternalLink)) return;

      // Material on ComponentMaterial
      if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial, setResource)) return;
      // Mesh on ComponentMesh
      if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, setResource)) return;
    }


    private filterDragDrop(_event: DragEvent, _filter: DragDropFilter, _callback: (_sources: Object[]) => boolean = () => true): boolean {
      let target: HTMLElement = <HTMLElement>_event.target;
      let typeElement: string = target.parentElement.getAttribute("key");
      let typeComponent: string = this.getAncestorWithType(target).getAttribute("type");

      if (_filter.onKeyAttribute && typeElement != _filter.onKeyAttribute) return false;
      if (_filter.onTypeAttribute && typeComponent != _filter.onTypeAttribute) return false;
      if (_filter.onType && !(this.mutable instanceof _filter.onType)) return false;

      let viewSource: View = View.getViewSource(_event);

      if (filter.fromViews) {
        if (!_filter.fromViews.find((_view) => viewSource instanceof _view))
          return false;
      }

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

    private getAncestorWithType(_target: EventTarget): HTMLElement {
      let element: HTMLElement = <HTMLElement>_target;
      while (element) {
        let type: string = element.getAttribute("type");
        if (type)
          return element;
        element = element.parentElement;
      }

      return null;
    }
  }
}