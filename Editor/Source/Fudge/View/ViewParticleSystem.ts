namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  // const fs: ƒ.General = require("fs");
  export class ViewParticleSystem extends View {
    private graph: ƒ.Graph;
    private node: ƒ.Node;
    private cmpParticleSystem: ƒ.ComponentParticleSystem;
    private particleEffect: ƒ.ParticleEffect;
    private particleEffectData: ƒ.ParticleEffectData;

    private controller: ControllerParticleSystem;
    private propertyList: HTMLDivElement;

    constructor(_container: ComponentContainer, _state: Object) {
        super(_container, _state);
        // let filename: string | string[] = remote.dialog.showOpenDialogSync(null, {
        //     properties: ["openFile", "promptToCreate"], title: "Select/Create a new particle system json", buttonLabel: "Save Particle System", filters: [{name: "json", extensions: ["json"]}]
        // });
      
        // if (!filename)
        // return;
    
        // let base: URL = new URL(new URL("file://" + filename[0]).toString() + "/");
        // // console.log("Path", base.toString());
        // this.setTitle(base.toString().match("/[A-Za-z._]*/$")[0]?.replaceAll("/", ""));

        // fs.readFile(base, "utf-8", (error, data) => {
        //     if (error?.code === "ENOENT")
        //         fs.writeFileSync(base, "{}");

        //     let div: HTMLDivElement = document.createElement("div");
        //     div.innerText = data;
        //     this.dom.appendChild(div);
        // });

        this.setParticleEffect(null);
        this.createUserInterface();

        this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
        this.dom.addEventListener(ƒui.EVENT.INPUT, this.hndEvent);
    }


    private hndEvent = async (_event: FudgeEvent): Promise<void> => {
      switch (_event.type) {
        case EVENT_EDITOR.FOCUS:
          this.graph = _event.detail.graph;
          this.node = _event.detail.node;
          this.cmpParticleSystem = this.node?.getComponent(ƒ.ComponentParticleSystem);
          await this.setParticleEffect(this.cmpParticleSystem?.particleEffect);
          break;
        case ƒui.EVENT.INPUT:
          this.controller.updateParticleEffectData();
          // this.particleEffect.parse(this.particleEffectData);
          this.cmpParticleSystem.particleEffect = this.particleEffect;
          break;
      }
    }

    private async setParticleEffect(_particleEffect: ƒ.ParticleEffect): Promise<void> {
      if (!_particleEffect) {
        this.particleEffect = undefined;
        this.dom.innerHTML = "select a node with an attached component particle system";
        return;
      }

      this.particleEffect = _particleEffect;
      this.particleEffectData = await this.load(this.particleEffect.url);
      this.dom.innerHTML = "";
      this.dom.appendChild(this.propertyList);
      this.recreatePropertyList(this.particleEffectData);
      this.updateUserInterface();

    }

    private createUserInterface(): void {
      this.propertyList = document.createElement("div");
    }

    private updateUserInterface(): void {
      // this.propertyList = document.createElement("div");

    }

    private recreatePropertyList(_particleEffectData: ƒ.ParticleEffectData): void {
      // let animationMutator: ƒ.Mutator = this.animation?.getMutated(this.playbackTime, 0, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
      // if (!animationMutator) animationMutator = {};
      let newPropertyListList: HTMLDivElement = ƒui.Generator.createInterfaceFromMutator(_particleEffectData);
      this.controller = new ControllerParticleSystem(_particleEffectData, newPropertyListList);
      this.dom.replaceChild(newPropertyListList, this.propertyList);
      this.propertyList = newPropertyListList;
    }

    /**
     * Asynchronously loads the json from the given url.
     */
    private async load(_url: RequestInfo): Promise<ƒ.ParticleEffectData> {
      if (!_url) return;
      return await window.fetch(_url).then(_response => _response.json());
    }

  }
}
