import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { MeshBuilder, Mesh } from 'babylonjs';
import { MeshesComponent } from '../meshes.component';
import { GlobalsService } from '../../../services/globals.service';
import { BuildMeshMessage } from '../../../services/interfaces';

@Component({
  selector: 'app-cylinder',
  templateUrl: './cylinder.component.html',
  styleUrls: ['./cylinder.component.css']
})
export class CylinderComponent implements OnInit, OnChanges {

  private inputs: HTMLCollectionOf<HTMLInputElement>;
  @Input() createMesh: BuildMeshMessage;
  @Output() meshCreatedEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(private globals: GlobalsService) { }

  ngOnChanges() {
    if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
      const name: string = this.createMesh.type + this.createMesh.count;
      MeshBuilder.CreateCylinder(name, {}, this.createMesh.scene);
      MeshesComponent.count++;
      this.meshCreatedEvent.emit(name);
    }
  }

  ngOnInit() {
    this.inputs = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('cylinderOptions');
  }

  public sendMessage() {
    const name: string = 'cylinder' + MeshesComponent.count;
    const height: number = parseFloat(this.inputs[0].value);
    const diameterTop: number = parseFloat(this.inputs[1].value);
    const diameterBottom: number = parseFloat(this.inputs[2].value);
    const tessellation: number = parseFloat(this.inputs[3].value);
    const subdivisions: number = parseFloat(this.inputs[4].value);
    const arc: number = parseFloat(this.inputs[5].value);

    MeshBuilder.CreateCylinder(
      name,
      {
        height: height,
        diameterTop: diameterTop,
        diameterBottom: diameterBottom,
        tessellation: tessellation,
        subdivisions: subdivisions,
        arc: arc,
        sideOrientation: Mesh.DOUBLESIDE
      },
      this.globals.scene);

    MeshesComponent.count++;

    this.meshCreatedEvent.emit(name);
  }

}
