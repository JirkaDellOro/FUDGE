namespace ParticleSystemTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  ƒ.Project.registerScriptNamespace(ParticleSystemTest);

  let viewport: ƒ.Viewport;
  window.addEventListener("load", init);

  async function init(): Promise<void> {
    let graphId: string = document.head.querySelector("meta[autoView]").getAttribute("autoView");
    await ƒ.Project.loadResourcesFromHTML();
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources[graphId];
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }

    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.dispatchEvent(new CustomEvent("start"));
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a

    function update(_event: Event): void {
      viewport.draw();
    }
  }

  export class ParticleSystemController extends ƒ.ComponentScript {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ParticleSystemController);

    public dependencyNames: string = "";
    #cmpParticleSystem: ƒ.ComponentParticleSystem;

    public constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    public get dependencies(): ƒ.Node[] {
      let dependencies: ƒ.Node[] = [];
      let root: ƒ.Node = this.node?.getAncestor();
      if (!root)
        return dependencies;

      for (let name of this.dependencyNames.split(", ")) {
        let dependency: ƒ.Node;
        for (let descendant of root) {
          if (descendant.name == name) {
            dependency = descendant;
            break;
          }
        }

        if (dependency)
          dependencies.push(dependency);
      }

      return dependencies;
    }

    // Activate the functions of this component as response to events
    private hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          ƒ.Loop.addEventListener("start", this.start);

          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    };

    private start = (_event: CustomEvent): void => {
      this.#cmpParticleSystem = this.node.getComponent(ƒ.ComponentParticleSystem);

      let activation: HTMLInputElement = document.getElementById(this.node.name.toLocaleLowerCase()) as HTMLInputElement;
      let size: HTMLInputElement = document.getElementById(this.node.name.toLocaleLowerCase() + "size") as HTMLInputElement;
      activation.checked = this.node.isActive;
      size.value = this.#cmpParticleSystem.size.toString();

      activation.onchange = (_event: Event): void => {
        this.node.activate(activation.checked);
        size.hidden = !activation.checked;
        this.dependencies.forEach(_node => _node.activate(activation.checked));
      };

      size.onchange = (_event: Event): void => {
        this.#cmpParticleSystem.size = size.valueAsNumber;
      };

      activation.dispatchEvent(new Event("change"));
    };


  }
}