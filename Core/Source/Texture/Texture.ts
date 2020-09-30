namespace FudgeCore {
  /**
   * Baseclass for different kinds of textures. 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export abstract class Texture extends Mutable {
    public name: string = "Texture";
    protected reduceMutator(_mutator: Mutator): void {
      // delete _mutator.idResource; 
    }
  }

  /**
   * Texture created from an existing image
   */
  export class TextureImage extends Texture implements SerializableResource {
    public image: HTMLImageElement = null;
    public url: RequestInfo;
    public idResource: string = undefined;

    constructor(_url?: RequestInfo) {
      super();
      if (_url) {
        this.load(_url);
        this.name = _url.toString().split("/").pop();
      }

      Project.register(this);
    }

    /**
     * Asynchronously loads the image from the given url
     */
    public async load(_url: RequestInfo): Promise<void> {
      this.url = _url;
      this.image = new Image();
      // const response: Response = await window.fetch(this.url);
      // const blob: Blob = await response.blob();
      // let objectURL: string = URL.createObjectURL(blob);
      // this.image.src = objectURL;

      return new Promise((resolve, reject) => {
        this.image.addEventListener("load", () => resolve());
        this.image.addEventListener("error", () => reject());
        this.image.src = new URL(this.url.toString(), Project.baseURL).toString();
      });
    }

    //#region Transfer
    public serialize(): Serialization {
      return {
        url: this.url,
        idResource: this.idResource,
        name: this.name,
        type: this.type // serialize for editor views
      };
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.load(_serialization.url);
      this.name = _serialization.name;
      // this.type is an accessor of Mutable doesn't need to be deserialized
      return this;
    }
    //#endregion
  }

  /**
   * Texture created from a canvas
   */
  export class TextureCanvas extends Texture {
  }
  /**
   * Texture created from a FUDGE-Sketch
   */
  export class TextureSketch extends TextureCanvas {
  }
  /**
   * Texture created from an HTML-page
   */
  export class TextureHTML extends TextureCanvas {
  }
}