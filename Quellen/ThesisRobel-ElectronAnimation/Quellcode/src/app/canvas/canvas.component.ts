import { Component, OnInit, OnDestroy } from '@angular/core';
import * as BABYLON from 'babylonjs';
import { Subscription, Subject } from 'rxjs';
import { GlobalsService } from '../services/globals.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, OnDestroy {

  private engine: BABYLON.Engine;
  private canvas: HTMLCanvasElement;
  private scene: BABYLON.Scene;
  private camera: BABYLON.Camera;

  private utilLayer: BABYLON.UtilityLayerRenderer;
  private positionGizmo: BABYLON.PositionGizmo;
  private rotationGizmo: BABYLON.RotationGizmo;
  private scalingGizmo: BABYLON.ScaleGizmo;
  private activGizmo: BABYLON.Gizmo;

  private selectedMeshSubscription: Subscription;

  private highlightedMesh: BABYLON.AbstractMesh;
  private scenePath: string;


  constructor(private globals: GlobalsService) {
    this.scenePath = '';
  }

  ngOnInit() {
    this.canvas = <HTMLCanvasElement>document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true, { stencil: true });
    this.engine.enableOfflineSupport = false;

    this.initScene();

    ///////////////////////// events /////////////////////////
    window.addEventListener('resize', this.resizeEngine);
    this.canvas.addEventListener('click', this.pickMesh);

    const buttons = document.getElementsByClassName('buttons');
    for (let index = 0; index < buttons.length; index++) {
      buttons[index].addEventListener('click', this.changeEditMode);
    }
    // subscribe to get the selected mesh
    this.selectedMeshSubscription = this.globals.selectedMesh.subscribe(this.receiveSelectedMesh);

    ///////////////////////// ipc /////////////////////////
    this.globals.ipcRenderer.on('delete-mesh', this.removeMesh);
    this.globals.ipcRenderer.on('reset-mesh', this.resetMesh);
    this.globals.ipcRenderer.on('reset-camera', this.resetCamera);
    this.globals.ipcRenderer.on('edit-mode', this.changeEditMode);
    this.globals.ipcRenderer.on('save-request', this.saveScene);
    this.globals.ipcRenderer.on('load-request', this.loadScene);
    this.globals.ipcRenderer.on('new-scene-request', this.newScene);
  }


  /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  *                                        event handler
  */////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * creates a new scene
   * @param {Event} _event
   */
  private newScene = (_event: Event) => {
    this.scenePath = '';
    this.initScene();
  }

  /**
   * saves the scene and shows an info dialog if successful
   * @param {Event} _event
   * @param {boolean} _save - true = save false= save as
   */
  private saveScene = (_event: Event, _save: boolean) => {
    let success: boolean;
    // destroy the gizmos to make sure it is not saved as well
    this.destroyUtilGizmo();

    const serialize = BABYLON.SceneSerializer.Serialize(this.scene);
    const json: string = JSON.stringify(serialize);

    if (_save) {
      success = this.globals.ipcRenderer.sendSync('save-scene', json);
    } else {
      success = this.globals.ipcRenderer.sendSync('saveAs-scene', json);
    }

    if (success) {
      this.globals.ipcRenderer.send('show-message', 'Scene is saved successfully', 'info');
      this.initUtilGizmos();
    }
  }

  /**
   * loads a  scene
   */
  private loadScene = (_event: Event) => {
    const path: string = this.globals.ipcRenderer.sendSync('load-scene');
    if (path) {
      this.scenePath = path;
      this.initScene();
    }
  }

  /**
   * prevents the distortion of the engine after resizing the window
   */
  private resizeEngine = () => {
    this.engine.resize();
  }

  /**
   * pick collisions
   */
  private pickMesh = () => {
    const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
    if (pickResult.hit) {
      const pickedMesh = pickResult.pickedMesh;
      this.highlightMesh(pickedMesh);
      this.showGizmo(pickedMesh);
      this.globals.selectedMesh.next(pickedMesh);
    } else {
      this.removeHighlight();
      this.showGizmo(null);
      this.globals.selectedMesh.next(undefined);
    }
  }

  /**
   * receive the selected mesh and inform the main process
   */
  private receiveSelectedMesh = (_mesh: BABYLON.AbstractMesh) => {
    if (_mesh) {
      this.highlightMesh(_mesh);
      this.showGizmo(_mesh);
      this.globals.ipcRenderer.send('send-mesh-selected', true);
    } else {
      this.globals.ipcRenderer.send('send-mesh-selected', false);
    }
  }

  /**
   * change between translation, ratotation and scaling
   */
  public changeEditMode = (_event: Event, _mode: string = '') => {
    if (_mode === '') {
      const target: HTMLInputElement = <HTMLInputElement>_event.target;
      _mode = target.id;
    }
    switch (_mode.toLowerCase()) {
      case 'translation':
        if (this.activGizmo !== this.positionGizmo) {
          this.positionGizmo.attachedMesh = this.highlightedMesh;
          this.showGizmo(null);
          this.activGizmo = this.positionGizmo;
        }
        break;
      case 'rotation':
        if (this.activGizmo !== this.rotationGizmo) {
          this.rotationGizmo.attachedMesh = this.highlightedMesh;
          this.showGizmo(null);
          this.activGizmo = this.rotationGizmo;
        }
        break;
      case 'scaling':
        if (this.activGizmo !== this.scalingGizmo) {
          this.scalingGizmo.attachedMesh = this.highlightedMesh;
          this.showGizmo(null);
          this.activGizmo = this.scalingGizmo;
        }
        break;
    }
  }

  /**
   * delete selected mesh
   */
  private removeMesh = (_event: Event) => {
    this.highlightedMesh.dispose();
    this.globals.selectedMesh.next(undefined);
    this.globals.sceneTree.next([this.highlightedMesh.name, 'remove']);
    this.highlightedMesh = undefined;
    this.showGizmo(null);
  }

  /**
   * reset selected mesh
   */
  private resetMesh = (_event: Event) => {
    this.highlightedMesh.position = new BABYLON.Vector3(0, 0, 0);
    this.highlightedMesh.rotationQuaternion = BABYLON.Quaternion.Zero();
    this.highlightedMesh.scaling = new BABYLON.Vector3(1, 1, 1);
  }

  /**
   * restore camera position
   */
  private resetCamera = (_event: Event) => {
    this.camera.restoreState();
  }

  /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  *                                         methods
  */////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * initiate either a new or an existing scene
   */
  private initScene(): void {

    this.deleteScene();

    // new scene
    if (this.scenePath === '') {
      this.scene = new BABYLON.Scene(this.engine);
      this.globals.scene = this.scene;

      // camera
      this.camera = new BABYLON.ArcRotateCamera('arcCamera', -Math.PI / 2, Math.PI / 4, 15, BABYLON.Vector3.Zero(), this.scene);
      this.camera.attachControl(this.canvas);
      this.camera.storeState();

      // light
      const light: BABYLON.HemisphericLight = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);

      // ground
      const ground: BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround('ground', { width: 10, height: 10, subdivisions: 4 }, this.scene);
      this.globals.sceneTree.next([ground.name, 'add']);

      this.initUtilGizmos();

    } else {
      // load scene
      BABYLON.SceneLoader.Load(this.scenePath, '', this.engine, (_scene: BABYLON.Scene) => {
        this.scene = _scene;
        this.globals.scene = this.scene;

        this.camera = this.scene.activeCamera;
        this.camera.attachControl(this.canvas);
        this.camera.storeState();

        // add meshes to scene graph
        for (let index = 0; index < this.scene.meshes.length; index++) {
          if (this.scene.meshes[index].parent) {
            this.globals.sceneTree.next([this.scene.meshes[index].name, 'add', this.scene.meshes[index].parent.name]);
          } else {
            this.globals.sceneTree.next([this.scene.meshes[index].name, 'add']);
          }
        }

        this.initUtilGizmos();
      });
    }

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }


  /**
   * clean up and delete the scene
   */
  private deleteScene(): void {
    this.globals.sceneTree.next(undefined);
    this.globals.selectedMesh.next(undefined);
    this.globals.selectedAnimation.next(undefined);
    this.highlightedMesh = undefined;
    if (this.scene) {
      this.scene.dispose();
    }
  }

  /**
   * highlight the selected mesh
   */
  private highlightMesh(_mesh: BABYLON.AbstractMesh): void {
    this.removeHighlight();
    _mesh.enableEdgesRendering();
    _mesh.edgesWidth = 5;
    _mesh.edgesColor = new BABYLON.Color4(255, 0, 0, 1);
    this.highlightedMesh = _mesh;
  }

  /**
   * remove the highlight of the last selected mesh
   */
  private removeHighlight(): void {
    if (this.highlightedMesh !== undefined) {
      this.highlightedMesh.disableEdgesRendering();
    }
    this.highlightedMesh = undefined;
  }

  /**
   * init utilityLayer and gizmos
   */
  private initUtilGizmos(): void {
    this.utilLayer = new BABYLON.UtilityLayerRenderer(this.scene);
    this.positionGizmo = new BABYLON.PositionGizmo(this.utilLayer);
    this.rotationGizmo = new BABYLON.RotationGizmo(this.utilLayer);
    this.scalingGizmo = new BABYLON.ScaleGizmo(this.utilLayer);

    this.activGizmo = this.positionGizmo;
  }

  /**
   * show/hide gizmo
   */
  private showGizmo(_mesh: BABYLON.AbstractMesh): void {
    this.activGizmo.attachedMesh = _mesh;
  }

  /**
   * destroy the utilityLayer and gizmos
   */
  private destroyUtilGizmo(): void {
    this.utilLayer.dispose();
    this.positionGizmo.dispose();
    this.rotationGizmo.dispose();
    this.scalingGizmo.dispose();
  }

  ngOnDestroy() {
    this.selectedMeshSubscription.unsubscribe();
  }
}
