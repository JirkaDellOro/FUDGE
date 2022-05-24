namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  // const fs: ƒ.General = require("fs");
  export class ViewParticleSystem extends View {
    private graph: ƒ.Graph;
    private node: ƒ.Node;
    private cmpParticleSystem: ƒ.ComponentParticleSystem;
    private particleEffect: ƒ.ParticleEffect;
    private particleEffectData: ƒ.ParticleEffectNodePath;
    private particleEffectStructure: ƒ.ParticleEffectStructure;

    // private controller: ControllerTreeParticleSystem;
    private tree: ƒui.CustomTree<ƒ.ParticleEffectNode>;
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
    }


    private hndEvent = async (_event: FudgeEvent): Promise<void> => {
      switch (_event.type) {
        case EVENT_EDITOR.FOCUS:
          this.graph = _event.detail.graph;
          this.node = _event.detail.node;
          this.cmpParticleSystem = this.node?.getComponent(ƒ.ComponentParticleSystem);
          await this.setParticleEffect(this.cmpParticleSystem?.particleEffect);
          break;
        case ƒui.EVENT.DELETE:
        case ƒui.EVENT.DROP:
        case ƒui.EVENT.RENAME:
          this.particleEffect.data = this.particleEffectData;
          break;
      }
    }

    private async setParticleEffect(_particleEffect: ƒ.ParticleEffect): Promise<void> {
      if (!_particleEffect) {
        this.particleEffect = undefined;
        this.tree = undefined;
        this.dom.innerHTML = "select a node with an attached component particle system";
        return;
      }

      this.particleEffect = _particleEffect;
      this.particleEffectData = _particleEffect.data;
      this.dom.innerHTML = "";
      this.dom.appendChild(this.canvas);
      this.recreateTree(this.particleEffectData);
      this.updateUserInterface();
      this.redraw();

    }


    private createUserInterface(): void {

      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");

      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";

    }

    private updateUserInterface(): void {
      // this.propertyList = document.createElement("div");

    }

    private recreateTree(_particleEffectData: ƒ.ParticleEffectNode): void {
      let newTree: ƒui.CustomTree<ƒ.ParticleEffectNode> = 
        new ƒui.CustomTree<ƒ.ParticleEffectNode>( new ControllerTreeParticleSystem(), this.particleEffectData );

      newTree.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
      newTree.addEventListener(ƒui.EVENT.DROP, this.hndEvent);
      newTree.addEventListener(ƒui.EVENT.DELETE, this.hndEvent);
      if (this.tree && this.dom.contains(this.tree)) 
        this.dom.replaceChild(newTree, this.tree);
      else 
        this.dom.appendChild(newTree);
      this.tree = newTree;
    }

    //#region drawing
    private redraw = () => {
      if (!this.particleEffect) return;
      this.canvas.width = this.dom.clientWidth - 300;
      this.canvas.height = this.dom.clientHeight;

      this.crc2.resetTransform();
      this.crc2.translate(0, 500);
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
      this.drawStructure(this.particleEffect.mtxLocal);
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
