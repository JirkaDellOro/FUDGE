namespace FudgeCore {
  /**
   * An {@link Animation} loaded from a glTF-File.
   * @authors Jonas Plotzky
   */
  export class AnimationGLTF extends mixinSerializableResourceExternal(Animation) {
    public async load(_url: RequestInfo = this.url, _name: string = this.name): Promise<AnimationGLTF> {
      this.url = _url;
      this.name = _name;
      return GLTFLoader.loadResource(this);
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.framesPerSecond = this.fps;
      return serialization;
    }
  }
}