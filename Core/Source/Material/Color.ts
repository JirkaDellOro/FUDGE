namespace FudgeCore {
  /**
   * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
   */ // TODO: cleanup, harmonize with Vector3, Matrix4x4 e.g. naming and logic of set, get (getArray), clone, copy etc.
  export class Color extends Mutable implements Serializable, Recycable {
    // crc2 only used for converting colors from strings predefined by CSS
    private static crc2: CanvasRenderingContext2D = (() => {
      const crc2: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      crc2.globalCompositeOperation = "copy";
      return crc2;
    })();

    public r: number;
    public g: number;
    public b: number;
    public a: number;

    public constructor(_r: number = 1, _g: number = 1, _b: number = 1, _a: number = 1) {
      super();
      this.setNormRGBA(_r, _g, _b, _a);
    }

    // /**
    //  * Returns a hex-code representation, i.e. "#RRGGBBAA", of the given css color keyword.
    //  */
    // public static getHexFromCSSKeyword(_keyword: string): string {
    //   let hex: string = "#";
    //   for (let byte of Color.getBytesRGBAFromCSSKeyword(_keyword))
    //     hex += byte.toString(16).padStart(2, "0");
    //   return hex;
    // }

    /**
     * Returns a {@link Uint8ClampedArray} with the 8-bit color channel values in the order RGBA.
     */
    public static getBytesRGBAFromCSS(_keyword: string): Uint8ClampedArray {
      Color.crc2.fillStyle = _keyword;
      Color.crc2.fillRect(0, 0, 1, 1);
      return Color.crc2.getImageData(0, 0, 1, 1).data;
    }

    /**
     * Returns a new {@link Color} object created from the given css color keyword. 
     * Passing an _alpha value will override the alpha value specified in the keyword.
     */
    public static CSS(_keyword: string, _alpha?: number): Color {
      // const bytesRGBA: Uint8ClampedArray = Color.getBytesRGBAFromCSS(_keyword);
      const color: Color = Recycler.get(Color);
      color.setCSS(_keyword, _alpha);
      // const color: Color = new Color(
      //   bytesRGBA[0] / 255,
      //   bytesRGBA[1] / 255,
      //   bytesRGBA[2] / 255,
      //   _alpha ?? bytesRGBA[3] / 255);
      return color;
    }

    // TODO: rename to MULTIPLICATION like in Matarix3x3/Matrix4x4?
    /**
     * Computes and retruns the product of two colors. 
     */
    public static MULTIPLY(_color1: Color, _color2: Color): Color {
      return new Color(_color1.r * _color2.r, _color1.g * _color2.g, _color1.b * _color2.b, _color1.a * _color2.a);
    }

    /**
     * Creates and returns a clone of this color
     */
    public get clone(): Color {
      let clone: Color = Recycler.get(Color);
      clone.copy(this);
      return clone;
    }

    public setCSS(_keyword: string, _alpha?: number): void {
      const bytesRGBA: Uint8ClampedArray = Color.getBytesRGBAFromCSS(_keyword);
      this.setBytesRGBA(bytesRGBA[0], bytesRGBA[1], bytesRGBA[2], bytesRGBA[3]);
      this.a = _alpha ?? this.a;
    }

    // TODO: rename to setClampedRGBA? Norm is misleading, since it is not normalized but clamped
    /**
     * Clamps the given color channel values bewteen 0 and 1 and sets them.
     */
    public setNormRGBA(_r: number, _g: number, _b: number, _a: number): void {
      this.r = Math.min(1, Math.max(0, _r));
      this.g = Math.min(1, Math.max(0, _g));
      this.b = Math.min(1, Math.max(0, _b));
      this.a = Math.min(1, Math.max(0, _a));
    }

    /**
     * Sets this color from the given 8-bit values for the color channels.
     */
    public setBytesRGBA(_r: number, _g: number, _b: number, _a: number): void {
      this.setNormRGBA(_r / 255, _g / 255, _b / 255, _a / 255);
    }

    /**
     * Returns a new {@link Float32Array} with the color channel values in the order RGBA.
     */
    public getArray(): Float32Array {
      return new Float32Array([this.r, this.g, this.b, this.a]);
    }

    /**
     * Clamps the given color channel values between 0 and 1 and sets them.
     */
    public setArrayNormRGBA(_color: Float32Array): void {
      this.setNormRGBA(_color[0], _color[1], _color[2], _color[3]);
    }

    /**
     * Sets this color from the given {@link Uint8ClampedArray}. Order of the channels is RGBA
     */
    public setArrayBytesRGBA(_color: Uint8ClampedArray): void {
      this.setBytesRGBA(_color[0], _color[1], _color[2], _color[3]);
    }

    /**
     * Returns a new {@link Uint8ClampedArray} with the color channel values in the order RGBA.
     */
    public getArrayBytesRGBA(): Uint8ClampedArray {
      return new Uint8ClampedArray([this.r * 255, this.g * 255, this.b * 255, this.a * 255]);
    }

    /**
     * Adds the given color to this.
     */
    public add(_color: Color): void {
      this.r += _color.r;
      this.g += _color.g;
      this.b += _color.b;
      this.a += _color.a;
    }

    /**
     * Returns the css color keyword representing this color.
     */
    public getCSS(): string {
      let bytes: Uint8ClampedArray = this.getArrayBytesRGBA();
      return `RGBA(${bytes[0]}, ${bytes[1]}, ${bytes[2]}, ${this.a})`;
    }

    /**
     * Returns the hex string representation of this color.
     */
    public getHex(): string {
      let bytes: Uint8ClampedArray = this.getArrayBytesRGBA();
      let hex: string = "";
      for (let byte of bytes)
        hex += byte.toString(16).padStart(2, "0");
      return hex;
    }

    /**
     * Sets this color from the given hex string color.
     */
    public setHex(_hex: string): void {
      let bytes: Uint8ClampedArray = this.getArrayBytesRGBA();
      let channel: number = 0;
      for (let byte in bytes)
        bytes[byte] = parseInt(_hex.substr(channel++ * 2, 2), 16);
      this.setArrayBytesRGBA(bytes);
    }

    public recycle(): void {
      this.r = 1; this.g = 1; this.b = 1; this.a = 1;
    }

    /**
     * Set this color to the values given by the color provided
     */
    public copy(_color: Color): void {
      this.r = _color.r;
      this.g = _color.g;
      this.b = _color.b;
      this.a = _color.a;
    }

    /**
     * Returns a formatted string representation of this color
     */
    public toString(): string {
      return `(r: ${this.r.toFixed(3)}, g: ${this.g.toFixed(3)}, b: ${this.b.toFixed(3)}, a: ${this.a.toFixed(3)})`;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = this.getMutator(true);
      // serialization.toJSON = () => { return `{ "r": ${this.r}, "g": ${this.g}, "b": ${this.b}, "a": ${this.a}}`; };
      serialization.toJSON = () => { return `[${this.r}, ${this.g}, ${this.b}, ${this.a}]`; };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      if (typeof (_serialization) == "string") {
        [this.r, this.g, this.b, this.a] = JSON.parse(<string><unknown>_serialization);
      } else
        this.mutate(_serialization);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {/** */ }
  }
}