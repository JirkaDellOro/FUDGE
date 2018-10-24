import { Component, OnInit } from '@angular/core';
import { GlobalsService } from '../../services/globals.service';
import { AbstractMesh, Animatable } from 'babylonjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  private mesh: AbstractMesh;
  private player: Animatable;
  private startFrame: number;
  private endFrame: number;


  constructor(private globals: GlobalsService) { }

  ngOnInit() {
    document.getElementById('play').addEventListener('click', this.playerController);
    document.getElementById('pause').addEventListener('click', this.playerController);
    document.getElementById('stop').addEventListener('click', this.playerController);
    document.getElementById('reset').addEventListener('click', this.playerController);

    this.globals.selectedMesh.subscribe(this.getMesh);
  }

  /**
   * get selected mesh
   * @param {BABYLON.AbstractMesh} _mesh
   */
  private getMesh = (_mesh: BABYLON.AbstractMesh) => {
    this.mesh = _mesh;
  }

  /**
   * control animation
   * @param {Event} _event
   */
  private playerController = (_event: Event) => {
    const target: HTMLElement = <HTMLElement>_event.target;

    if (this.mesh === undefined) {
      return;
    }

    // get current running animatables of target mesh
    if (this.globals.scene.getAnimatableByTarget(this.mesh)) {
      this.player = this.globals.scene.getAnimatableByTarget(this.mesh);
    }

    switch (target.id) {
      case 'play':
        this.startFrame = (<HTMLInputElement>document.getElementById('startFrame')).valueAsNumber;
        this.endFrame = (<HTMLInputElement>document.getElementById('endFrame')).valueAsNumber;
        this.player = this.globals.scene.beginAnimation(this.mesh, this.startFrame, this.endFrame, true);
        break;
      case 'pause':
        if (this.player.animationStarted) {
          this.player.pause();
        } else {
          this.player.restart();
        }
        break;
      case 'stop':
        this.player.stop();
        break;
      case 'reset':
        this.player.reset();
        break;
    }
  }

}
