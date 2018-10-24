import { Injectable } from '@angular/core';
import { Scene, AbstractMesh } from 'babylonjs';
import { Subject } from 'rxjs';
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public scene: Scene;
  public selectedMesh: Subject<AbstractMesh>;
  public selectedAnimation: Subject<string[]>;
  public sceneTree: Subject<string[]>;
  public ipcRenderer: Electron.IpcRenderer;


  constructor() {
    this.selectedMesh = new Subject();
    this.selectedAnimation = new Subject();
    this.sceneTree = new Subject();
    this.ipcRenderer = new ElectronService().ipcRenderer;

  }
}
