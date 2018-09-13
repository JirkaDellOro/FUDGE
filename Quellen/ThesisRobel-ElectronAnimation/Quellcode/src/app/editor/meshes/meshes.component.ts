import { Component, OnInit } from '@angular/core';
import { BuildMeshMessage } from '../../services/interfaces';
import { GlobalsService } from '../../services/globals.service';

@Component({
  selector: 'app-meshes',
  templateUrl: './meshes.component.html',
  styleUrls: ['./meshes.component.css']
})
export class MeshesComponent implements OnInit {

  public static count: number;
  public name: string;
  private createMeshMessage: BuildMeshMessage;
  private message: BuildMeshMessage;


  constructor(private globals: GlobalsService) {
    MeshesComponent.count = 0;
    this.name = 'box';
  }

  ngOnInit() {
    const radioBtns = document.getElementsByClassName('meshButtons');
    for (let index = 0; index < radioBtns.length; index++) {
      radioBtns[index].addEventListener('click', this.getMeshName);
    }

    this.globals.ipcRenderer.on('create-mesh', this.buildInstructions);
  }

  private getMeshName = (_event: Event) => {
    this.name = (<HTMLInputElement>_event.target).value;
  }

  private buildInstructions = (_event: Event, _name: string) => {
    this.name = _name.toLowerCase();

    this.message = {
      count: MeshesComponent.count,
      type: this.name,
      scene: this.globals.scene,
      isBuilt: false
    };

    this.createMeshMessage = this.message;
  }

  private createdMesh(_name: string) {
    this.globals.sceneTree.next([_name, 'add']);
    // end of buildmessage
    this.message = {
      count: MeshesComponent.count,
      type: this.name,
      scene: this.globals.scene,
      isBuilt: true
    };
    this.createMeshMessage = this.message;
  }

}
