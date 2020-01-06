namespace FudgeCore {
  /**
   * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
   */
  export class Color extends Mutable { //implements Serializable {
    // crc2 only used for converting colors from strings predefined by CSS
    private static crc2: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d");

    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(_r: number = 1, _g: number = 1, _b: number = 1, _a: number = 1) {
      super();
      this.setNormRGBA(_r, _g, _b, _a);
    }

    public static getHexFromCSSKeyword(_keyword: string): string {
      Color.crc2.fillStyle = _keyword;
      return Color.crc2.fillStyle;
    }

    public static CSS(_keyword: string, _alpha: number = 1): Color {
      let hex: string = Color.getHexFromCSSKeyword(_keyword);
      let color: Color = new Color(
        parseInt(hex.substr(1, 2), 16) / 255,
        parseInt(hex.substr(3, 2), 16) / 255,
        parseInt(hex.substr(5, 2), 16) / 255,
        _alpha);
      return color;
    }


    public static MULTIPLY(_color1: Color, _color2: Color): Color {
      return new Color(_color1.r * _color2.r, _color1.g * _color2.g, _color1.b * _color2.b, _color1.a * _color2.a);
    }

    public setNormRGBA(_r: number, _g: number, _b: number, _a: number): void {
      this.r = Math.min(1, Math.max(0, _r));
      this.g = Math.min(1, Math.max(0, _g));
      this.b = Math.min(1, Math.max(0, _b));
      this.a = Math.min(1, Math.max(0, _a));
    }

    public setBytesRGBA(_r: number, _g: number, _b: number, _a: number): void {
      this.setNormRGBA(_r / 255, _g / 255, _b / 255, _a / 255);
    }

    public getArray(): Float32Array {
      return new Float32Array([this.r, this.g, this.b, this.a]);
    }

    public setArrayNormRGBA(_color: Float32Array): void {
      this.setNormRGBA(_color[0], _color[1], _color[2], _color[3]);
    }

    public setArrayBytesRGBA(_color: Uint8ClampedArray): void {
      this.setBytesRGBA(_color[0], _color[1], _color[2], _color[3]);
    }

    public getArrayBytesRGBA(): Uint8ClampedArray {
      return new Uint8ClampedArray([this.r * 255, this.g * 255, this.b * 255, this.a * 255]);
    }

    public add(_color: Color): void {
      this.r += _color.r;
      this.g += _color.g;
      this.b += _color.b;
      this.a += _color.a;
    }

    public getCSS(): string {
      let bytes: Uint8ClampedArray = this.getArrayBytesRGBA();
      return `RGBA(${bytes[0]}, ${bytes[1]}, ${bytes[2]}, ${bytes[3]})`;
    }

    protected reduceMutator(_mutator: Mutator): void {/** */ }
  }
}