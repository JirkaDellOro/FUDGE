import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { MeshBuilder } from 'babylonjs';
import { MeshesComponent } from '../meshes.component';
import { GlobalsService } from '../../../services/globals.service';
import { BuildMeshMessage } from '../../../services/interfaces';

@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.css']
})
export class GroundComponent implements OnInit, OnChanges {

  private inputs: HTMLCollectionOf<HTMLInputElement>;
  @Input() createMesh: BuildMeshMessage;
  @Output() meshCreatedEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(private globals: GlobalsService) { }

  ngOnChanges() {
    if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
      const name: string = this.createMesh.type + this.createMesh.count;
      MeshBuilder.CreateGround(name, {}, this.createMesh.scene);
      MeshesComponent.count++;
      this.meshCreatedEvent.emit(name);
    }
  }

  ngOnInit() {
    this.inputs = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('groundOptions');
  }

  public sendMessage() {
    const name: string = 'ground' + MeshesComponent.count;
    const width: number = parseFloat(this.inputs[0].value);
    const height: number = parseFloat(this.inputs[1].value);

    MeshBuilder.CreateGround(name, { width: width, height: height }, this.globals.scene);

    MeshesComponent.count++;

    this.meshCreatedEvent.emit(name);
  }

}
