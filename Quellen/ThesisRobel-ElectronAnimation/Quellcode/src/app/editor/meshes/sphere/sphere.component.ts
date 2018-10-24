import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { MeshBuilder } from 'babylonjs';
import { MeshesComponent } from '../meshes.component';
import { GlobalsService } from '../../../services/globals.service';
import { BuildMeshMessage } from '../../../services/interfaces';

@Component({
  selector: 'app-sphere',
  templateUrl: './sphere.component.html',
  styleUrls: ['./sphere.component.css']
})
export class SphereComponent implements OnInit, OnChanges {

  private inputs: HTMLCollectionOf<HTMLInputElement>;
  @Input() createMesh: BuildMeshMessage;
  @Output() meshCreatedEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(private globals: GlobalsService) { }

  ngOnChanges() {
    if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
      const name: string = this.createMesh.type + this.createMesh.count;
      MeshBuilder.CreateSphere(name, {}, this.createMesh.scene);
      MeshesComponent.count++;
      this.meshCreatedEvent.emit(name);
    }
  }

  ngOnInit() {
    this.inputs = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('sphereOptions');
  }

  public sendMessage() {
    const name: string = 'sphere' + MeshesComponent.count;
    const segments: number = parseFloat(this.inputs[0].value);
    const diameterX: number = parseFloat(this.inputs[1].value);
    const diameterY: number = parseFloat(this.inputs[2].value);
    const diameterZ: number = parseFloat(this.inputs[3].value);
    const arc: number = parseFloat(this.inputs[4].value);
    const slice: number = parseFloat(this.inputs[5].value);

    MeshBuilder.CreateSphere(
      name,
      {
        segments: segments,
        diameterX: diameterX,
        diameterY: diameterY,
        diameterZ: diameterZ,
        arc: arc,
        slice: slice
      },
      this.globals.scene);
    MeshesComponent.count++;

    this.meshCreatedEvent.emit(name);
  }

}
