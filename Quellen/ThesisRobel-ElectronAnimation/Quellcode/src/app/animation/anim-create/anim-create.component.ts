import { Component, OnInit } from '@angular/core';
import * as BABYLON from 'babylonjs';
import { Subscription } from 'rxjs';
import { GlobalsService } from '../../services/globals.service';

@Component({
  selector: 'app-anim-create',
  templateUrl: './anim-create.component.html',
  styleUrls: ['./anim-create.component.css']
})
export class AnimCreateComponent implements OnInit {

  private meshSubscription: Subscription;
  private mesh: BABYLON.AbstractMesh;

  private animTarget: string;
  private animName: string;
  private animFps: string;
  private animBehavior: string;
  private easingFunction: string;
  private easingMode: string;
  public useEasing: boolean;

  constructor(private globals: GlobalsService) {
    this.meshSubscription = this.globals.selectedMesh.subscribe(this.getMesh);
    this.useEasing = false;
  }

  ngOnInit() {
    document.getElementById('setEasing').addEventListener('click', this.setEasing);
    document.getElementById('animOptButton').addEventListener('click', this.getAnimInfo);
  }

  /**
   * get the selected mesh
   * @param {BABYLON.AbstractMesh} _mesh - selected mesh
   */
  private getMesh = (_mesh: BABYLON.AbstractMesh) => {
    this.mesh = _mesh;
  }

  /**
   * sets the state of the easing checkbox
   */
  private setEasing = () => {
    this.useEasing = (<HTMLInputElement>document.getElementById('setEasing')).checked;
  }

  /**
   * get the input values and call createAnimation()
   */
  private getAnimInfo = () => {
    if (this.mesh === undefined) {
      this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
      return;
    }
    this.animTarget = (<HTMLInputElement>document.getElementById('animProperty')).value;
    this.animName = (<HTMLInputElement>document.getElementById('animName')).value;
    this.animFps = (<HTMLInputElement>document.getElementById('animFrames')).value;
    this.animBehavior = (<HTMLInputElement>document.getElementById('animBehavior')).value;
    // check if name is available
    if (this.animName === '') {
      this.globals.ipcRenderer.send('show-message', 'The animation name is invalid', 'warning');
      return;
    }
    const animationName = this.mesh.getAnimationByName(this.animName);
    if (animationName !== null) {
      this.globals.ipcRenderer.send('show-message', 'This name is not available', 'warning');
      return;
    }
    this.createAnimation();
  }

  /**
   * create a new animation
   */
  private createAnimation(): void {
    const fps: number = parseInt(this.animFps, 10);
    const animDataTyp: number = BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
    let loopmode: number;
    // loop mode
    switch (this.animBehavior) {
      case 'relative':
        loopmode = BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE;
        break;
      case 'cycle':
        loopmode = BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE;
        break;
      case 'constant':
        loopmode = BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT;
        break;
    }
    // create ainmation
    const newAnimation: BABYLON.Animation = new BABYLON.Animation(this.animName, this.animTarget, fps, animDataTyp, loopmode);

    // define empty animation (important for the SceneSerializer)
    newAnimation.setKeys([]);

    // if use easing is checked, add selected easing function to animaation
    if (this.useEasing) {
      this.createEasing();
      newAnimation.setEasingFunction(this.createEasing());
    }

    // add animation to mesh
    this.mesh.animations.push(newAnimation);
  }

  /**
   * create an easing function
   * @returns {BABYLON.EasingFunction} a new easing function
   */
  private createEasing(): BABYLON.EasingFunction {
    this.easingFunction = (<HTMLInputElement>document.getElementById('easingFn')).value;
    this.easingMode = (<HTMLInputElement>document.getElementById('easingMode')).value;

    let easingFn: BABYLON.EasingFunction;

    // easing function
    switch (this.easingFunction) {
      case 'circle':
        easingFn = new BABYLON.CircleEase();
        break;
      case 'back':
        easingFn = new BABYLON.BackEase();
        break;
      case 'bounce':
        easingFn = new BABYLON.BounceEase();
        break;
      case 'cubic':
        easingFn = new BABYLON.CubicEase();
        break;
      case 'elastic':
        easingFn = new BABYLON.ElasticEase();
        break;
      case 'exponential':
        easingFn = new BABYLON.ExponentialEase();
        break;
      case 'power':
        easingFn = new BABYLON.PowerEase();
        break;
      case 'quadratic':
        easingFn = new BABYLON.QuadraticEase();
        break;
      case 'quartic':
        easingFn = new BABYLON.QuarticEase();
        break;
      case 'quintic':
        easingFn = new BABYLON.QuinticEase();
        break;
      case 'sine':
        easingFn = new BABYLON.SineEase();
        break;
      case 'bezier':
        easingFn = new BABYLON.BezierCurveEase();
        break;
    }

    // easing mode
    switch (this.easingMode) {
      case 'easeIn':
        easingFn.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        break;
      case 'easeOut':
        easingFn.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        break;
      case 'easeInOut':
        easingFn.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        break;
    }

    return easingFn;
  }



}
