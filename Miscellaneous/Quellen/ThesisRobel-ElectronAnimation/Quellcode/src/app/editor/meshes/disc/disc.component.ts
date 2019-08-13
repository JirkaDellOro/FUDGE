import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { MeshBuilder } from 'babylonjs';
import { MeshesComponent } from '../meshes.component';
import { GlobalsService } from '../../../services/globals.service';
import { BuildMeshMessage } from '../../../services/interfaces';

@Component({
  selector: 'app-disc',
  templateUrl: './disc.component.html',
  styleUrls: ['./disc.component.css']
})
export class DiscComponent implements OnInit, OnChanges {

  private inputs: HTMLCollectionOf<HTMLInputElement>;
  @Input() createMesh: BuildMeshMessage;
  @Output() meshCreatedEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(private globals: GlobalsService) { }

  ngOnChanges() {
    if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
      const name: string = this.createMesh.type + this.createMesh.count;
      MeshBuilder.CreateDisc(name, {}, this.createMesh.scene);
      MeshesComponent.count++;
      this.meshCreatedEvent.emit(name);
    }
  }

  ngOnInit() {
    this.inputs = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('discOptions');
  }

  public sendMessage() {
    const name: string = 'disc' + MeshesComponent.count;
    const radius: number = parseFloat(this.inputs[0].value);
    const tessellation: number = parseFloat(this.inputs[1].value);
    const arc: number = parseFloat(this.inputs[2].value);

    MeshBuilder.CreateDisc(
      name,
      {
        radius: radius,
        tessellation: tessellation,
        arc: arc
      },
      this.globals.scene);

    MeshesComponent.count++;

    this.meshCreatedEvent.emit(name);
  }

}
