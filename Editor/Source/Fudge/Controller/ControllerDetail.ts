///<reference path="../View/View.ts"/>
///<reference path="../View/Project/ViewExternal.ts"/>
///<reference path="../View/Project/ViewInternalFolder.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

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
    UrlOnMeshOBJ: { fromViews: [ViewExternal], onKeyAttribute: "url", onTypeAttribute: "MeshOBJ", ofType: DirectoryEntry, dropEffect: "link" },
    UrlOnAudio: { fromViews: [ViewExternal], onKeyAttribute: "url", onTypeAttribute: "Audio", ofType: DirectoryEntry, dropEffect: "link" },
    UrlOnMeshGLTF: { fromViews: [ViewExternal], onKeyAttribute: "url", onTypeAttribute: "MeshGLTF", ofType: DirectoryEntry, dropEffect: "link" },
    MaterialOnComponentMaterial: { fromViews: [ViewInternal], onType: ƒ.ComponentMaterial, ofType: ƒ.Material, dropEffect: "link" },
    MeshOnComponentMesh: { fromViews: [ViewInternal], onType: ƒ.ComponentMesh, ofType: ƒ.Mesh, dropEffect: "link" },
    AnimationOnComponentAnimator: { fromViews: [ViewInternal], onType: ƒ.ComponentAnimator, ofType: ƒ.Animation, dropEffect: "link" },
    ParticleSystemOnComponentParticleSystem: { fromViews: [ViewInternal], onType: ƒ.ComponentParticleSystem, ofType: ƒ.ParticleSystem, dropEffect: "link" },
    // MeshOnMeshLabel: { fromViews: [ViewInternal], onKeyAttribute: "mesh", ofType: ƒ.Mesh, dropEffect: "link" },
    TextureOnMaterialTexture: { fromViews: [ViewInternal], onKeyAttribute: "texture", onType: ƒ.Material, ofType: ƒ.Texture, dropEffect: "link" },
    TextureOnMaterialNormalMap: { fromViews: [ViewInternal], onKeyAttribute: "normalMap", onType: ƒ.Material, ofType: ƒ.Texture, dropEffect: "link" },

    TextureOnAnimationSprite: { fromViews: [ViewInternal], onType: ƒ.AnimationSprite, ofType: ƒ.Texture, dropEffect: "link" },
    TextureOnMeshRelief: { fromViews: [ViewInternal], onType: ƒ.MeshRelief, ofType: ƒ.TextureImage, dropEffect: "link" }
  };

  export class ControllerDetail extends ƒUi.Controller {
    public constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      super(_mutable, _domElement);
      this.domElement.addEventListener(ƒUi.EVENT.INPUT, this.mutateOnInput, true); // this should be obsolete
      this.domElement.addEventListener(ƒUi.EVENT.DRAG_OVER, this.hndDragOver);
      this.domElement.addEventListener(ƒUi.EVENT.DROP, this.hndDrop);
      this.domElement.addEventListener(ƒUi.EVENT.KEY_DOWN, this.hndKey);
      this.domElement.addEventListener(ƒUi.EVENT.INSERT, this.hndInsert);
    }

    protected mutateOnInput = async (_event: Event): Promise<void> => {
      // TODO: move this to Ui.Controller as a general optimization to only mutate what has been changed...!
      this.getMutator = super.getMutator;

      let path: string[] = [];
      for (let target of _event.composedPath()) {
        if (target == document)
          break;
        let key: string = (<HTMLElement>target).getAttribute("key");
        if (key)
          path.push(key);
      }
      path.pop();
      path.reverse();
      let mutator: ƒ.Mutator = ƒ.Mutable.getMutatorFromPath(this.getMutator(), path);
      this.getMutator = (_mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator => {
        this.getMutator = super.getMutator; // reset
        return mutator;
      };
    };
    //#endregion

    private hndInsert = (_event: CustomEvent): void => {
      console.log("INSERT at ControllerDetail");
      console.log(_event.detail);
      let mutable: ƒ.Mutable = this.mutable[_event.detail.getAttribute("key")];
      console.log(mutable.type);
      if (mutable instanceof ƒ.MutableArray)
        mutable.push(new mutable.type());
    };

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.DELETE:
          this.domElement.dispatchEvent(new CustomEvent(ƒUi.EVENT.DELETE, { bubbles: true, detail: this }));
          break;
      }
    };

    private hndDragOver = (_event: DragEvent): void => {
      // url on texture
      if (this.filterDragDrop(_event, filter.UrlOnTexture, checkMimeType(MIME.IMAGE))) return;
      // url on meshobj
      if (this.filterDragDrop(_event, filter.UrlOnMeshOBJ, checkMimeType(MIME.MESH))) return;
      // url on audio
      if (this.filterDragDrop(_event, filter.UrlOnAudio, checkMimeType(MIME.AUDIO))) return;
      // url on meshgltf
      if (this.filterDragDrop(_event, filter.UrlOnMeshGLTF, checkMimeType(MIME.GLTF))) return;

      // Material on ComponentMaterial
      if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial)) return;
      // Mesh on ComponentMesh
      // if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, (_sources: Object[]) => {
      //   let key: string = this.getAncestorWithType(_event.target).getAttribute("key");
      //   return (key == "mesh");
      // })) return;
      if (this.filterDragDrop(_event, filter.MeshOnComponentMesh)) return;
      // Mesh on MeshLabel
      // if (this.filterDragDrop(_event, filter.MeshOnMeshLabel)) return;
      // Texture on Material texture
      if (this.filterDragDrop(_event, filter.TextureOnMaterialTexture)) return;
      // Texture on Material normal map
      if (this.filterDragDrop(_event, filter.TextureOnMaterialNormalMap)) return;
      // Texture on MeshRelief
      if (this.filterDragDrop(_event, filter.TextureOnMeshRelief)) return;
      // Texture on AnimationSprite
      if (this.filterDragDrop(_event, filter.TextureOnAnimationSprite)) return;
      // Animation of ComponentAnimation
      if (this.filterDragDrop(_event, filter.AnimationOnComponentAnimator)) return;
      // ParticleSystem of ComponentParticleSystem
      if (this.filterDragDrop(_event, filter.ParticleSystemOnComponentParticleSystem)) return;


      function checkMimeType(_mime: MIME): (_sources: Object[]) => boolean {
        return (_sources: Object[]): boolean => {
          let sources: DirectoryEntry[] = <DirectoryEntry[]>_sources;
          return (sources.length == 1 && sources[0].getMimeType() == _mime);
        };
      }
    };

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
        if (!this.mutable[key]) return false;
        this.mutable[key] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setMaterial: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["material"] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setMesh: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["mesh"] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setTexture: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["coat"]["texture"] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setNormalMap: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["coat"]["normalMap"] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setSpriteTexture: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["texture"] = _sources[0];
        this.mutable.mutate({}); // force recreation using new texture
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setHeightMap: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        // this.mutable["texture"] = _sources[0];
        let mutator: ƒ.Mutator = this.mutable.getMutator();
        mutator.texture = _sources[0];
        this.mutable.mutate(mutator);
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };
      let setAnimation: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["animation"] = _sources[0];
        // this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        this.domElement.dispatchEvent(new CustomEvent(EVENT_EDITOR.MODIFY, { bubbles: true, detail: this }));
        return true;
      };
      let setParticleSystem: (_sources: Object[]) => boolean = (_sources: Object[]): boolean => {
        this.mutable["particleSystem"] = _sources[0];
        this.domElement.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
        return true;
      };

      // texture
      if (this.filterDragDrop(_event, filter.UrlOnTexture, setExternalLink)) return;
      // texture
      if (this.filterDragDrop(_event, filter.UrlOnMeshOBJ, setExternalLink)) return;
      // audio
      if (this.filterDragDrop(_event, filter.UrlOnAudio, setExternalLink)) return;

      // Material on ComponentMaterial
      if (this.filterDragDrop(_event, filter.MaterialOnComponentMaterial, setMaterial)) return;
      // Mesh on ComponentMesh
      if (this.filterDragDrop(_event, filter.MeshOnComponentMesh, setMesh)) return;
      // Mesh on MeshLabel
      // if (this.filterDragDrop(_event, filter.MeshOnMeshLabel, setMesh)) return;
      // Texture on Material texture
      if (this.filterDragDrop(_event, filter.TextureOnMaterialTexture, setTexture)) return;
      // Texture on Material normal map
      if (this.filterDragDrop(_event, filter.TextureOnMaterialNormalMap, setNormalMap)) return;
      // Texture on MeshRelief
      if (this.filterDragDrop(_event, filter.TextureOnMeshRelief, setHeightMap)) return;
      // Texture on AnimationSprite
      if (this.filterDragDrop(_event, filter.TextureOnAnimationSprite, setSpriteTexture)) return;
      // Animation on ComponentAnimator
      if (this.filterDragDrop(_event, filter.AnimationOnComponentAnimator, setAnimation)) return;
      // ParticleSystem on ComponentParticleSystem
      if (this.filterDragDrop(_event, filter.ParticleSystemOnComponentParticleSystem, setParticleSystem)) return;
    };


    private filterDragDrop(_event: DragEvent, _filter: DragDropFilter, _callback: (_sources: Object[]) => boolean = () => true): boolean {
      let target: HTMLElement = <HTMLElement>_event.target;
      let typeElement: string = target.parentElement.getAttribute("key");
      let typeComponent: string = this.getAncestorWithType(target).getAttribute("type");

      if (_filter.onKeyAttribute && typeElement != _filter.onKeyAttribute) return false;
      if (_filter.onTypeAttribute && typeComponent != _filter.onTypeAttribute) return false;
      if (_filter.onType && !(this.mutable instanceof _filter.onType)) return false;

      let viewSource: View = View.getViewSource(_event);

      if (!_filter.fromViews?.find((_view) => viewSource instanceof _view))
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