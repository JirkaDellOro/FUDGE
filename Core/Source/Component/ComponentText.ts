namespace FudgeCore {
  /**
   * Attaches a {@link TextureText} to the node. 
   * Works in conjunction with {@link ComponentMesh} and {@link ComponentMaterial} to create a text node.
   * A 'textured' {@link Material} (e.g. {@link ShaderLitTextured}) must be used to display the text properly. Ideally a {@link MeshQuad} should be used to render the text onto.
   * Additionally a {@link ComponentFaceCamera} can be attached to make the text face the camera.
   * @authors Jonas Plotzky, HFU, 2024
   */
  export class ComponentText extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentText);

    public readonly texture: TextureText;
    public readonly mtxWorld: Matrix4x4;

    /** - on: The texts size is fixed to match the set font size
     *  - off: The font size is stretched to match the attached meshes size
     */
    public fixedSize: boolean;

    public constructor(_text?: string, _font?: string) {
      super();
      this.texture = new TextureText(ComponentText.name, _text, _font);
      this.mtxWorld = Matrix4x4.IDENTITY();
      this.fixedSize = false;
    }

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }

    public useRenderData(_mtxMeshToWorld: Matrix4x4, _cmpCamera: ComponentCamera): Matrix4x4 {
      this.texture.useRenderData(TEXTURE_LOCATION.COLOR.UNIT);
      this.mtxWorld.set(_mtxMeshToWorld);

      let scaling: Vector3 = Recycler.get(Vector3);

      if (this.fixedSize) {
        let scale: number;
        let rect: Rectangle = Render.getRenderRectangle();
        switch (_cmpCamera.getDirection()) {
          case FIELD_OF_VIEW.VERTICAL:
            scale = 1 / rect.height * window.devicePixelRatio;
            break;
          case FIELD_OF_VIEW.HORIZONTAL:
            scale = 1 / rect.width * window.devicePixelRatio;
            break;
          case FIELD_OF_VIEW.DIAGONAL:
            scale = 1 / Math.sqrt((rect.width * rect.height) * window.devicePixelRatio);
            break;
        }

        let distance: number = _cmpCamera.mtxWorld.translation.getDistance(_mtxMeshToWorld.translation);
        scale = scale * distance;
        scaling.set(this.texture.width * scale, this.texture.height * scale, 1);
        this.mtxWorld.scaling = scaling;
        Recycler.store(distance);
      } else {
        let pixelsToUnits: number = 1 / this.texture.height;
        scaling.set(this.texture.width * pixelsToUnits, this.texture.height * pixelsToUnits, 1);
        this.mtxWorld.scale(scaling);
      }


      Recycler.store(scaling);
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
      delete _mutator.texture.name;
    }
  }
}