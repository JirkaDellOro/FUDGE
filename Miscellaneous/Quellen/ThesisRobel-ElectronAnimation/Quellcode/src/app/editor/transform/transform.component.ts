import { Component, OnInit, OnDestroy } from '@angular/core';
import { Vector3, AbstractMesh } from 'babylonjs';
import { Subscription } from 'rxjs';
import { GlobalsService } from '../../services/globals.service';

@Component({
  selector: 'app-transform',
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.css']
})
export class TransformComponent implements OnInit, OnDestroy {

  private inputs: HTMLCollectionOf<HTMLInputElement>;
  private mesh: AbstractMesh;

  private meshSubscription: Subscription;

  constructor(private globals: GlobalsService) { }

  ngOnInit() {
    // event
    this.inputs = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('transformValue');
    for (let index = 0; index < this.inputs.length; index++) {
      this.inputs[index].addEventListener('input', this.modifyValues);
    }

    this.meshSubscription = this.globals.selectedMesh.subscribe(this.getMesh);
  }

  private getMesh = (_mesh: AbstractMesh) => {
    this.mesh = _mesh;
    this.showValues();
  }

  /**
  * change the position, rotation and scaling of selected mesh after changing it in the view
  */
  private modifyValues = (_event: Event) => {
    const position: Vector3 = new Vector3(parseInt(this.inputs[0].value, 10), parseInt(this.inputs[1].value, 10), parseInt(this.inputs[2].value, 10));
    const rotation: Vector3 = new Vector3(parseFloat(this.inputs[3].value), parseFloat(this.inputs[4].value), parseFloat(this.inputs[5].value));
    const scaling: Vector3 = new Vector3(parseInt(this.inputs[6].value, 10), parseInt(this.inputs[7].value, 10), parseInt(this.inputs[8].value, 10));

    this.mesh.position = position;
    this.mesh.scaling = scaling;
    this.mesh.rotationQuaternion = rotation.toQuaternion();
  }

  /**
  * receives the position, rotation and scaling of selected mesh
  */
  private showValues(): void {
    let transformInfo: HTMLCollectionOf<HTMLInputElement>;
    transformInfo = <HTMLCollectionOf<HTMLInputElement>>document.getElementsByClassName('transformValue');

    if (this.mesh === undefined) {
      for (let i = 0; i < transformInfo.length; i++) {
        transformInfo[i].value = '0';
      }
      return;
    }

    transformInfo[0].value = this.mesh.position.x.toString();
    transformInfo[1].value = this.mesh.position.y.toString();
    transformInfo[2].value = this.mesh.position.z.toString();

    if (this.mesh.rotationQuaternion !== undefined && this.mesh.rotationQuaternion !== null) {
      transformInfo[3].value = this.mesh.rotationQuaternion.toEulerAngles().x.toString();
      transformInfo[4].value = this.mesh.rotationQuaternion.toEulerAngles().y.toString();
      transformInfo[5].value = this.mesh.rotationQuaternion.toEulerAngles().z.toString();
    } else {
      transformInfo[3].value = this.mesh.rotation.x.toString();
      transformInfo[4].value = this.mesh.rotation.y.toString();
      transformInfo[5].value = this.mesh.rotation.z.toString();
    }

    transformInfo[6].value = this.mesh.scaling.x.toString();
    transformInfo[7].value = this.mesh.scaling.y.toString();
    transformInfo[8].value = this.mesh.scaling.z.toString();
  }

  ngOnDestroy() {
    this.meshSubscription.unsubscribe();
  }

}
