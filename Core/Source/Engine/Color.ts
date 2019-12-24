namespace FudgeCore {
  export enum COLOR {
    BLACK,
    WHITE,

    RED,
    GREEN,
    BLUE,
    YELLOW,
    CYAN,
    MAGENTA,

    LIGHT_GREY,
    LIGHT_RED,
    LIGHT_GREEN,
    LIGHT_BLUE,
    LIGHT_YELLOW,
    LIGHT_CYAN,
    LIGHT_MAGENTA,

    DARK_GREY,
    DARK_RED,
    DARK_GREEN,
    DARK_BLUE,
    DARK_YELLOW,
    DARK_CYAN,
    DARK_MAGENTA
  }

  /**
   * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
   */
  export class Color extends Mutable { //implements Serializable {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(_r: number = 1, _g: number = 1, _b: number = 1, _a: number = 1) {
      super();
      this.setNormRGBA(_r, _g, _b, _a);
    }

    public static get BLACK(): Color { return new Color(0, 0, 0, 1); }
    public static get WHITE(): Color { return new Color(1, 1, 1, 1); }

    public static get RED(): Color { return new Color(1, 0, 0, 1); }
    public static get GREEN(): Color { return new Color(0, 1, 0, 1); }
    public static get BLUE(): Color { return new Color(0, 0, 1, 1); }
    public static get YELLOW(): Color { return new Color(1, 1, 0, 1); }
    public static get CYAN(): Color { return new Color(0, 1, 1, 1); }
    public static get MAGENTA(): Color { return new Color(1, 0, 1, 1); }
    public static get GREY(): Color { return new Color(0.5, 0.5, 0.5, 1); }

    public static get LIGHT_GREY(): Color { return new Color(0.75, 0.75, 0.75, 1); }
    public static get LIGHT_RED(): Color { return new Color(1, 0.5, 0.5, 1); }
    public static get LIGHT_GREEN(): Color { return new Color(0.5, 1, 0.5, 1); }
    public static get LIGHT_BLUE(): Color { return new Color(0.5, 0.5, 1, 1); }
    public static get LIGHT_YELLOW(): Color { return new Color(1, 1, 0.5, 1); }
    public static get LIGHT_CYAN(): Color { return new Color(0.5, 1, 1, 1); }
    public static get LIGHT_MAGENTA(): Color { return new Color(1, 0.5, 1, 1); }

    public static get DARK_GREY(): Color { return new Color(0.25, 0.25, 0.25, 1); }
    public static get DARK_RED(): Color { return new Color(0.5, 0, 0, 1); }
    public static get DARK_GREEN(): Color { return new Color(0, 0.5, 0, 1); }
    public static get DARK_BLUE(): Color { return new Color(0, 0, 0.5, 1); }
    public static get DARK_YELLOW(): Color { return new Color(0.5, 0.5, 0, 1); }
    public static get DARK_CYAN(): Color { return new Color(0, 0.5, 0.5, 1); }
    public static get DARK_MAGENTA(): Color { return new Color(0.5, 0, 0.5, 1); }

    public static PRESET(_color: COLOR): Color {
      // TODO: replace above getters with switch here... Reason: it's more like an enum and should be documented as such
      return new Color(1, 1, 1, 1);
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
    }

    public getCSS(): string {
      let bytes: Uint8ClampedArray = this.getArrayBytesRGBA();
      return `RGBA(${bytes[0]}, ${bytes[1]}, ${bytes[2]}, ${bytes[3]})`
    }

    protected reduceMutator(_mutator: Mutator): void {/** */ }
  }
}