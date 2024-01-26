namespace FudgeCore {
  /**
   * TODO:
   * @authors Jonas Plotzky, HFU, 2024
   */
  export class ComponentText extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentText);

    public readonly texture: TextureCanvas = new TextureCanvas("ComponentTextTexture", document.createElement("canvas").getContext("2d"));
    public readonly mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY();

    #text: string;
    #font: string = "20px monospace";
    #scaling: Vector3 = Vector3.ONE();

    #dirty: boolean = true;

    public constructor(_text: string = "", _font: string = "20px monospace") {
      super();
      this.text = _text;
      this.font = _font;
    }

    public set text(_text: string) {
      if (this.#text == _text || _text == null)
        return;
      this.#text = _text;
      this.#dirty = true;
    }

    public get text(): string {
      return this.#text;
    }

    public set font(_font: string) {
      if (this.#font == _font || _font == null)
        return;
      this.#font = _font;
      this.#dirty = true;
    }

    public get font(): string {
      return this.#font;
    }

    private get canvas(): HTMLCanvasElement {
      return <HTMLCanvasElement>this.texture.crc2.canvas;
    }

    public getMutator(_extendable?: boolean): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.text = this.text;
      mutator.font = this.font;
      return mutator;
    }

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }

    public useRenderData(_mtxMeshToWorld: Matrix4x4): Matrix4x4 {
      this.refresh();
      this.texture.useRenderData(TEXTURE_LOCATION.COLOR.UNIT);
      this.mtxWorld.set(_mtxMeshToWorld);
      let pixelsPerUnit: number = 1 / this.canvas.height;
      this.#scaling.set(this.canvas.width * pixelsPerUnit, this.canvas.height * pixelsPerUnit, 1);
      this.mtxWorld.scale(this.#scaling);
      return this.mtxWorld;
    }

    public drawGizmosSelected(): void {
      let mesh: Mesh = this.node.getComponent(ComponentMesh)?.mesh;
      let cmpMaterial: ComponentMaterial = this.node.getComponent(ComponentMaterial);
      if (mesh == null || cmpMaterial == null)
        return;

      Gizmos.drawWireMesh(mesh, this.mtxWorld, cmpMaterial.clrPrimary);
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      // delete _mutator.texture;
      delete _mutator.mtxWorld;
    }

    // TODO: make async an wait for font to be loaded using document.fonts
    private refresh(): void {
      if (!this.#dirty)
        return;

      const crc2: CanvasRenderingContext2D = <CanvasRenderingContext2D>this.texture.crc2;
      crc2.font = this.#font;
      crc2.textAlign = "center";
      crc2.textBaseline = "middle";

      const lines: string[] = this.#text.split("\n");

      let [width, height] = lines.reduce(([_width, _height], _line) => {
        let metrics: TextMetrics = crc2.measureText(_line);
        let width: number = metrics.width;
        let height: number = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        return [_width > width ? _width : width, _height + height];
      }, [0, 0]);

      crc2.canvas.width = width;
      crc2.canvas.height = height * 1.1; // padding, otherwise on some glyphs might get cut off
      if (crc2.canvas.width == 0)
        return;

      crc2.font = this.#font;
      crc2.textAlign = "center";
      crc2.textBaseline = "middle";
      crc2.fillStyle = "white";
      crc2.clearRect(0, 0, crc2.canvas.width, crc2.canvas.height);
      crc2.fillText(this.#text, crc2.canvas.width / 2, crc2.canvas.height / 2);
      this.texture.refresh();
      this.#dirty = false;
    }
  }
}