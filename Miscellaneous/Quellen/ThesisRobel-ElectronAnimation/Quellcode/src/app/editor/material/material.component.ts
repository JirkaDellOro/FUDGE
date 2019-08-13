import { Component, OnInit } from '@angular/core';
import { GlobalsService } from '../../services/globals.service';
import * as BABYLON from 'babylonjs';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {

  private colorPicker: HTMLInputElement;
  private material: BABYLON.StandardMaterial;
  private mesh: BABYLON.AbstractMesh;

  constructor(private globals: GlobalsService) { }

  ngOnInit() {
    this.colorPicker = <HTMLInputElement>document.getElementById('color');
    // events
    document.getElementById('apply').addEventListener('click', this.applyColor);
    document.getElementById('file').addEventListener('click', this.requestTexturePath);
    this.globals.ipcRenderer.on('texturePath-reply', this.applyTexture);
    this.globals.selectedMesh.subscribe(this.getMesh);
  }

  private getMesh = (_mesh: BABYLON.AbstractMesh) => {
    this.mesh = _mesh;
  }

  private applyColor = (_event: Event) => {
    const colorName: HTMLInputElement = <HTMLInputElement>document.getElementById('colorName');

    if (colorName.value === '') {
      this.globals.ipcRenderer.send('show-message', 'The name is invalid', 'warning');
      return;
    } else if (this.mesh === undefined) {
      this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
    }

    this.material = new BABYLON.StandardMaterial(colorName.value, this.globals.scene);
    this.material.diffuseColor = BABYLON.Color3.FromHexString(this.colorPicker.value);

    if (this.mesh !== undefined) {
      this.mesh.material = this.material;
    }
  }

  private requestTexturePath = (_event: Event) => {
    if (this.mesh === undefined) {
      this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
      return;
    }
    const target: HTMLButtonElement = <HTMLButtonElement>_event.target;
    target.disabled = true;
    this.globals.ipcRenderer.send('get-texture-path');
  }

  private applyTexture = (_event: Event, _texturePath: string) => {
    const button: HTMLButtonElement = <HTMLButtonElement>document.getElementById('file');
    const textureName: HTMLInputElement = <HTMLInputElement>document.getElementById('textureName');

    button.disabled = false;

    if (textureName.value === '') {
      this.globals.ipcRenderer.send('show-message', 'The name is invalid', 'warning');
      return;
    }

    if (_texturePath) {
      const material2 = new BABYLON.StandardMaterial(textureName.value, this.globals.scene);
      material2.diffuseTexture = new BABYLON.Texture(_texturePath, this.globals.scene);

      if (this.mesh !== undefined) {
        this.mesh.material = material2;
      }
    }
  }
}
