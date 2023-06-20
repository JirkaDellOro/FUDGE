namespace FudgeCore {
  /** {@link TexImageSource} is a union type which as of now includes {@link VideoFrame}. All other parts of this union have a .width and .height property but VideoFrame does not. And since we only ever use {@link HTMLImageElement} and {@link OffscreenCanvas} currently VideoFrame can be excluded for convenience of accessing .width and .height */
  type ImageSource = Exclude<TexImageSource, VideoFrame>;

  export enum MIPMAP {
    CRISP, MEDIUM, BLURRY
  }
  /**
   * Baseclass for different kinds of textures. 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  @RenderInjectorTexture.decorate
  export abstract class Texture extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;
    public mipmap: MIPMAP = MIPMAP.CRISP;
    protected renderData: { [key: string]: unknown };

    public constructor(_name: string = "Texture") {
      super();
      this.name = _name;
    }

    public abstract get texImageSource(): ImageSource;
    public useRenderData(): void {/* injected by RenderInjector*/ }

    public refresh(): void {
      this.renderData = null;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        idResource: this.idResource,
        name: this.name,
        mipmap: MIPMAP[this.mipmap]
      };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      this.mipmap = <number><unknown>MIPMAP[_serialization.mipmap];
      return this;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.mipmap)
        types.mipmap = MIPMAP;
      return types;
    }

    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.idResource;
    }
  }

  /**
   * Texture created from an existing image
   */
  export class TextureImage extends Texture {
    public image: HTMLImageElement = null;
    public url: RequestInfo;

    public constructor(_url?: RequestInfo) {
      super();
      if (_url) {
        this.load(_url);
        this.name = _url.toString().split("/").pop();
      }

      Project.register(this);
    }

    public get texImageSource(): ImageSource {
      return this.image;
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

      return new Promise((_resolve, _reject) => {
        this.image.addEventListener("load", () => {
          this.renderData = null; // refresh render data on next draw call
          _resolve();
        });
        this.image.addEventListener("error", () => _reject());
        this.image.src = new URL(this.url.toString(), Project.baseURL).toString();
      });
    }

    //#region Transfer
    public serialize(): Serialization {
      return {
        url: this.url,
        type: this.type, // serialize for editor views
        [super.constructor.name]: super.serialize()
      };
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      await this.load(_serialization.url);
      // this.type is an accessor of Mutable doesn't need to be deserialized
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      if (_mutator.url != this.url.toString())
        await this.load(_mutator.url);
      // except url from mutator for further processing
      delete (_mutator.url);
      super.mutate(_mutator);
      // TODO: examine necessity to reconstruct, if mutator is kept by caller
      // _mutator.url = this.url; 
    }
    //#endregion
  }

  /**
   * Texture created from a canvas
   */
  export class TextureBase64 extends Texture {
    public image: HTMLImageElement = new Image();

    public constructor(_name: string, _base64: string, _mipmap: MIPMAP = MIPMAP.CRISP) {
      super(_name);
      this.image.src = _base64;
      this.mipmap = _mipmap;
    }
    public get texImageSource(): ImageSource {
      return this.image;
    }
  }
  /**
   * Texture created from a canvas
   */
  export class TextureCanvas extends Texture {
    public crc2: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    public constructor(_name: string, _crc2: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
      super(_name);
      this.crc2 = _crc2;
    }
    public get texImageSource(): ImageSource {
      return this.crc2.canvas;
    }
  }
  /**
   * Texture created from a FUDGE-Sketch
   */
  export class TextureSketch extends TextureCanvas {
    public get texImageSource(): ImageSource {
      return null;
    }
  }
  /**
   * Texture created from an HTML-page
   */
  export class TextureHTML extends TextureCanvas {
    public get texImageSource(): ImageSource {
      return null;
    }
  }
}