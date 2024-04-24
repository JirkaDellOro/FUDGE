namespace FudgeCore {
  /** {@link TexImageSource} is a union type which as of now includes {@link VideoFrame}. All other parts of this union have a .width and .height property but VideoFrame does not. And since we only ever use {@link HTMLImageElement} and {@link OffscreenCanvas} currently VideoFrame can be excluded for convenience of accessing .width and .height */
  type ImageSource = Exclude<TexImageSource, VideoFrame>;

  export enum MIPMAP {
    CRISP, MEDIUM, BLURRY
  }

  export enum WRAP {
    REPEAT, CLAMP, MIRROR
  }

  /**
   * Baseclass for different kinds of textures. 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  @RenderInjectorTexture.decorate
  export abstract class Texture extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;

    protected renderData: unknown;

    protected textureDirty: boolean = true;
    protected mipmapDirty: boolean = true;
    protected wrapDirty: boolean = true;

    #mipmap: MIPMAP = MIPMAP.CRISP;
    #wrap: WRAP = WRAP.REPEAT;

    #hasTransparency: boolean;

    public constructor(_name: string = "Texture") {
      super();
      this.name = _name;
    }

    public set mipmap(_mipmap: MIPMAP) {
      this.#mipmap = _mipmap;
      this.mipmapDirty = true;
    }

    public get mipmap(): MIPMAP {
      return this.#mipmap;
    }

    public set wrap(_wrap: WRAP) {
      this.#wrap = _wrap;
      this.wrapDirty = true;
    }

    public get wrap(): WRAP {
      return this.#wrap;
    }

    /**
     * Returns true if the texture has any texels with alpha < 1. 
     * ⚠️ CAUTION: Has to be recomputed whenever the texture/image data changes.
     */
    public get hasTransparency(): boolean { // Only tested for texImageSource of type HTMLImageElement and HTMLCanvasElement
      if (this.#hasTransparency != null)
        return this.#hasTransparency;

      let imageData: ImageData;

      if (this.texImageSource instanceof ImageData) {
        imageData = this.texImageSource;
      } else {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = this.texImageSource.width;
        canvas.height = this.texImageSource.height;
        const crc2: CanvasRenderingContext2D = canvas.getContext('2d');
        crc2.drawImage(this.texImageSource, 0, 0);
        imageData = crc2.getImageData(0, 0, this.texImageSource.width, this.texImageSource.height);
      }

      for (let i: number = 0; i < imageData.data.length; i += 4)
        if (imageData.data[i + 3] < 255)
          return this.#hasTransparency = true;

      return this.#hasTransparency = false;
    }

    protected set hasTransparency(_hasTransparency: boolean) {
      this.#hasTransparency = _hasTransparency;
    }

    /**
     * Returns the image source of this texture.
     */
    public abstract get texImageSource(): ImageSource;

    /**
     * Generates and binds the texture in WebGL from the {@link texImageSource}. 
     * Injected by {@link RenderInjectorTexture}. Used by the render system.
     * @internal
     */
    public useRenderData(_textureUnit: number = 0): void {/* injected by RenderInjector*/ }

    /**
     * Deletes the texture in WebGL freeing the allocated gpu memory.
     * Injected by {@link RenderInjectorTexture}.
     * @internal
     */
    public deleteRenderData(): void {/* injected by RenderInjector*/ }

    /**
     * Refreshes the image data in the render engine.
     */
    public refresh(): void {
      this.textureDirty = true;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        idResource: this.idResource,
        name: this.name,
        mipmap: MIPMAP[this.#mipmap],
        wrap: WRAP[this.#wrap]
      };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      this.#mipmap = <number><unknown>MIPMAP[_serialization.mipmap];
      this.#wrap = <number><unknown>WRAP[_serialization.wrap];
      return this;
    }

    public getMutator(_extendable?: boolean): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.mipmap = this.#mipmap;
      mutator.wrap = this.#wrap;
      return mutator;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.mipmap)
        types.mipmap = MIPMAP;
      if (types.wrap)
        types.wrap = WRAP;
      return types;
    }

    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.idResource;
      delete _mutator.renderData;
      delete _mutator.textureDirty;
      delete _mutator.mipmapDirty;
      delete _mutator.mipmapGenerated;
      delete _mutator.wrapDirty;
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
          this.hasTransparency = null; // reset transparency check
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

    public async mutate(_mutator: Mutator, _selection: string[] = null, _dispatchMutate: boolean = true): Promise<void> {
      if (_mutator.url && _mutator.url != this.url.toString())
        await this.load(_mutator.url);
      // except url from mutator for further processing
      delete (_mutator.url);
      await super.mutate(_mutator, _selection, _dispatchMutate);
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

    public constructor(_name: string, _base64: string, _mipmap: MIPMAP = MIPMAP.CRISP, _wrap: WRAP = WRAP.REPEAT, _width?: number, _height?: number) {
      super(_name);
      this.image.src = _base64;
      this.mipmap = _mipmap;
      if (_width)
        this.image.width = _width;
      if (_height)
        this.image.height = _height;
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
   * Texture created from a text. Texture upates when the text or font changes. The texture is resized to fit the text.
   * @authors Jonas Plotzky, HFU, 2024
   */
  export class TextureText extends Texture {
    protected crc2: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    #text: string;
    #font: string;

    public constructor(_name: string, _text: string = "Text", _font: string = "20px monospace") {
      super(_name);
      this.crc2 = document.createElement("canvas").getContext("2d");
      this.text = _text;
      this.font = _font;
    }

    public set text(_text: string) {
      this.#text = _text;
      this.textureDirty = true;
    }

    public get text(): string {
      return this.#text;
    }

    public set font(_font: string) {
      this.#font = _font;
      document.fonts.load(this.#font)
        .catch((_error) => Debug.error(`${TextureText.name}: ${_error}`))
        .finally(() => this.textureDirty = true);
    }

    public get font(): string {
      return this.#font;
    }

    public get texImageSource(): ImageSource {
      return this.canvas;
    }

    public get width(): number {
      return this.canvas.width;
    }

    public get height(): number {
      return this.canvas.height;
    }

    public get hasTransparency(): boolean {
      return true;
    }

    private get canvas(): HTMLCanvasElement | OffscreenCanvas {
      return this.crc2.canvas;
    }

    public useRenderData(_textureUnit?: number): void {
      if (this.textureDirty) {
        this.crc2.font = this.font;

        let metrics: TextMetrics = this.crc2.measureText(this.text);
        let width: number = metrics.width;
        let height: number = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        this.canvas.width = width + this.crc2.measureText("  ").width;
        this.canvas.height = height * 1.1; // padding, otherwise on some glyphs might get cut off
        if (this.canvas.width == 0)
          return;

        this.crc2.font = this.font; // TODO: wait for font to be loaded using document.fonts
        this.crc2.textAlign = "center";
        this.crc2.textBaseline = "middle";
        this.crc2.fillStyle = "white";
        this.crc2.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.crc2.fillText(this.#text, this.canvas.width / 2, this.canvas.height / 2);
      }

      super.useRenderData(_textureUnit);
    }

    public serialize(): Serialization {
      return {
        [super.constructor.name]: super.serialize(),
        text: this.text,
        font: this.font
      };
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      this.text = _serialization.text;
      this.font = _serialization.font;
      return this;
    }

    public getMutator(_extendable?: boolean): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.text = this.text;
      mutator.font = this.font;
      return mutator;
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