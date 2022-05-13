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
    // private particleEffectStructure: ƒ.ParticleEffectStructure;

    private controller: ControllerParticleSystem;
    private propertyList: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private crc2: CanvasRenderingContext2D;

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

        ƒ.Render.setBlendMode(ƒ.BLEND.PARTICLE);
        ƒ.Render.setDepthTest(false);

        this.createUserInterface();
        this.setParticleEffect(null);

        _container.on("resize", this.redraw);
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
      this.dom.appendChild(this.canvas);
      this.recreatePropertyList(this.particleEffectData);
      this.updateUserInterface();
      this.redraw();

    }

    /**
     * Asynchronously loads the json from the given url.
     */
     private async load(_url: RequestInfo): Promise<ƒ.ParticleEffectData> {
      if (!_url) return;
      return await window.fetch(_url).then(_response => _response.json());
    }    

    private createUserInterface(): void {
      this.propertyList = document.createElement("div");
      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");

      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";

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
      this.propertyList.style.width = "300px";
      this.propertyList.style.height = "100%";
      this.propertyList.style.overflow = "auto";
    }

    //#region drawing
    private redraw = () => {
      if (!this.particleEffect) return;
      this.canvas.width = this.dom.clientWidth - this.propertyList.clientWidth;
      this.canvas.height = this.dom.clientHeight;

      this.crc2.resetTransform();
      this.crc2.translate(0, 500);
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
      // this.drawStructure(this.particleEffect.mtxLocal);
    }

    private drawStructure(_structureOrFunction: ƒ.ParticleEffectStructure | Function): void {
      if (_structureOrFunction instanceof Function) {
        this.drawClosure(_structureOrFunction);
      } else {
        for (const property in _structureOrFunction) {
          this.drawStructure(_structureOrFunction[property]);
        }
      }
    }

    private drawClosure(_closure: Function): void {
      let variables: ƒ.ParticleVariables = this.cmpParticleSystem.variables;
      for (let iParticle: number = 0; iParticle < variables[ƒ.PARTICLE_VARIBALE_NAMES.SIZE]; iParticle += 1) {
        // console.log(iParticle);
        this.crc2.strokeStyle = this.randomColor();
        this.crc2.lineWidth = 2;
        this.crc2.beginPath();

        
        for (let time: number = 0; time < 20; time++) {
          variables[ƒ.PARTICLE_VARIBALE_NAMES.TIME] = 0;
          // this.cmpParticleSystem.evaluateStorage(this.particleEffect.storageUpdate);
          variables[ƒ.PARTICLE_VARIBALE_NAMES.INDEX] = iParticle;
          // this.cmpParticleSystem.evaluateStorage(this.particleEffect.storageParticle);
          variables["1-particleTime"] = time / 10;
          let x: number = time * 100;
          let y: number = -_closure(variables) * 1000;
          // console.log(y);
          if (x == 0) this.crc2.moveTo(x, y);
          else this.crc2.lineTo(x, y);
        }
        this.crc2.stroke();
      }
    }

    private randomColor(): string {
      return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
    }
    //#endregion
  }
}
