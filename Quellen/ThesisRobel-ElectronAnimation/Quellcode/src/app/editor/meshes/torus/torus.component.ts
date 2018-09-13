import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { MeshBuilder } from 'babylonjs';
import { MeshesComponent } from '../meshes.component';
import { GlobalsService } from '../../../services/globals.service';
import { BuildMeshMessage } from '../../../services/interfaces';

@Component({
  selector: 'app-torus',
  templateUrl: './torus.component.html',
  styleUrls: ['./torus.component.css']
})
export class TorusComponent implements OnInit, OnChanges {

  private inputs: HTMLCollectionOf<HTMLInputElement>;
  @Input() createMesh: BuildMeshMessage;
  @Output() meshCreatedEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(private globals: GlobalsService) { }

  ngOnChanges() {
    if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
      const name: string = this.createMesh.type + this.createMesh.count;
      MeshBuilder.CreateTorus(name, {}, this.createMesh.scene);
      MeshesComponent.count++;
      this.meshCreatedEvent.emit(name);
    }
  }

  ngOnInit() {
    this.inputs = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('torusOptions');
  }

  public sendMessage() {
    const name: string = 'torus' + MeshesComponent.count;
    const diameter: number = parseFloat(this.inputs[0].value);
    const thickness: number = parseFloat(this.inputs[1].value);
    const tessellation: number = parseFloat(this.inputs[2].value);

    MeshBuilder.CreateTorus(
      name,
      {
        diameter: diameter,
        thickness: thickness,
        tessellation: tessellation
      },
      this.globals.scene);

    MeshesComponent.count++;

    this.meshCreatedEvent.emit(name);
  }

}
