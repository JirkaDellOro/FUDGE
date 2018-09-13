import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractMesh, Animation } from 'babylonjs';
import { GlobalsService } from '../../services/globals.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-animation-display',
  templateUrl: './animation-display.component.html',
  styleUrls: ['./animation-display.component.css']
})
export class AnimationDisplayComponent implements OnInit, OnDestroy {

  public mesh: AbstractMesh;
  private selectedMeshSubscription: Subscription;

  constructor(private globals: GlobalsService) { }

  ngOnInit() {
    this.selectedMeshSubscription = this.globals.selectedMesh.subscribe(this.getSelectedMesh);
  }

  /**
   * get selected mesh
   * @param {AbstractMesh} _mesh - selected mesh
   */
  private getSelectedMesh = (_mesh: AbstractMesh) => {
    this.mesh = _mesh;
  }

  /**
   * Get selected animation. Gets called from the html template.
   * @param {MouseEvent} _event
   */
  private getAnimation = (_event: MouseEvent) => {
    const span: HTMLSummaryElement = <HTMLSummaryElement>_event.currentTarget;
    const animName: string = (<HTMLSpanElement>span.lastChild).innerHTML;
    // emit animation name
    this.globals.selectedAnimation.next([animName, 'add']);
  }

  /**
   * Delete animation. Gets called from the html template.
   * @param {MouseEvent} _event
   */
  private deleteAnim = (_event: MouseEvent) => {
    const target: HTMLElement = <HTMLElement>_event.target;
    const animName: string = target.parentElement.lastElementChild.innerHTML;
    const meshAnimations: Animation[] = this.mesh.animations;
    const animtable: BABYLON.Animatable = this.globals.scene.getAnimatableByTarget(this.mesh);

    this.globals.selectedAnimation.next([animName, 'remove']);

    for (let index = 0; index < meshAnimations.length; index++) {
      const element = meshAnimations[index];
      // stop animation if it is playing
      if (element.name === animName) {
        if (animtable) {
          animtable.stop();
          animtable.reset();
        }
        // delete animation
        meshAnimations.splice(index, 1);
      }
    }
  }

  ngOnDestroy() {
    this.selectedMeshSubscription.unsubscribe();
  }

}
