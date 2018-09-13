import { Component, OnInit } from '@angular/core';
import { GlobalsService } from '../../services/globals.service';
import * as Konva from 'konva';
import * as BABYLON from 'babylonjs';

@Component({
  selector: 'app-anim-timeline',
  templateUrl: './anim-timeline.component.html',
  styleUrls: ['./anim-timeline.component.css']
})
export class AnimTimelineComponent implements OnInit {

  private mesh: BABYLON.AbstractMesh;
  public animation: BABYLON.Animation;
  private animKeys: BABYLON.IAnimationKey[] = [];

  private container: HTMLDivElement;
  private stage: Konva.Stage;
  private staticLayer: Konva.Layer;
  private dynamicLayer: Konva.Layer;
  private pointer: Konva.Rect;

  private width: number;
  private height: number;
  private distance: number;

  private linesDrawn: Konva.Rect[] = [];
  private keysDrawn: string[] = [];

  private minDistance: number;
  private startX: number;
  private framesNum;
  private lineHeight;
  private lineWidth;


  constructor(private globals: GlobalsService) {
    this.minDistance = 10;
    this.startX = 5;
    this.framesNum = 500;
    this.lineHeight = 50;
    this.lineWidth = 3;
    this.globals.selectedMesh.subscribe(this.getMesh);
    this.globals.selectedAnimation.subscribe(this.getAnimation);
  }

  ngOnInit() {
    this.container = <HTMLDivElement>document.getElementById('konvaContainer');
    this.container.addEventListener('mousewheel', this.scrollDiv);
    // wait until other components initialize
    setTimeout(() => { this.initStage(); }, 10);
  }

  /**
   * get selected mesh
   */
  private getMesh = (_mesh: BABYLON.AbstractMesh) => {
    this.mesh = _mesh;
  }

  /**
   * get selected animation
   * @param {strin[]} _anim - contains animation name and whether it gets added or removed
   */
  private getAnimation = (_anim: string[]) => {
    if (_anim === undefined) {
      this.animation = undefined;
      this.animKeys.length = 0;
      if (this.stage) {
        this.deleteDrawnKeys(true);
      }
      return;
    }
    if (this.animation === undefined && _anim[1] === 'add') {
      this.animation = this.mesh.getAnimationByName(_anim[0]);
      this.getAnimationKeys();
    } else if (this.animation !== undefined && _anim[1] === 'remove') {
      if (this.animation.name === _anim[0]) {
        this.animation = undefined;
        this.animKeys.length = 0;
        this.deleteDrawnKeys(true);
      }
    }
  }

  /**
   * get the keyframes of the animation
   */
  private getAnimationKeys(): void {
    const animationKeys: BABYLON.IAnimationKey[] = this.animation.getKeys();
    if (animationKeys) {
      this.animKeys = animationKeys.slice(0);       // get a copy of the animation key array
      let frame: number;
      let value: BABYLON.Vector3;
      let xPos: number;

      for (let index = 0; index < animationKeys.length; index++) {
        frame = animationKeys[index].frame;
        value = animationKeys[index].value;
        xPos = this.linesDrawn[frame].x();
        this.drawOldKeys(xPos, frame, value.toString());
      }
    }
  }

  /**
   * Reacts to the click events. Gets called from the html template.
   * @param {strin} _action - add / revert / cancel
   */
  private getAction = (_action: string) => {
    switch (_action) {
      case 'cancel':
        this.animation = undefined;
        this.animKeys.length = 0;
        this.deleteDrawnKeys(true);
        break;
      case 'add':
        if (this.animation && this.animKeys.length !== 0) {
          this.animKeys = this.animKeys.sort((a, b) => a.frame - b.frame);  // sort keys numerically
          this.animation.setKeys(this.animKeys);
          this.animKeys.length = 0;
          this.deleteDrawnKeys(true);
          this.getAnimationKeys();
        }
        break;
      case 'revert':
        this.animKeys.length = 0;
        this.deleteDrawnKeys(false);
        break;
    }
  }

  /**
   * scroll horizontally
   *  @param {MouseWheelEvent} _event
   */
  private scrollDiv = (_event: MouseWheelEvent) => {
    _event.preventDefault();
    const target: HTMLDivElement = <HTMLDivElement>this.container.parentElement;
    const deltaY: number = _event.deltaY;
    target.scrollLeft += deltaY;
  }

  /**
   * initiate the stage with 2 layer and drawn lines
   */
  private initStage(): void {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.stage = new Konva.Stage({
      container: this.container.id,
      width: this.width,
      height: this.height
    });

    this.staticLayer = new Konva.Layer();
    this.dynamicLayer = new Konva.Layer();
    this.stage.add(this.staticLayer);
    this.stage.add(this.dynamicLayer);

    this.drawLines(this.framesNum);
    this.drawPointer();
    this.drawHorizontalLine(52);
    this.drawHorizontalLine(75);
  }


  /**
   * draw the old keyframes of the animation
   * @param {number} _x - position of the key in the timeline
   * @param {number} _frame - frame of the keyframe
   * @param {number} _data - value of the keyframe
   */
  private drawOldKeys(_x: number, _frame: number, _data: string): void {
    const w = 10;
    const y = 55;
    const color = 'rgb(253, 46, 98)';
    const id: string = 'oldKey' + _frame.toString();
    const data: string = _data;

    const poly = new Konva.Line({
      points: [_x, y, _x + w, y + w, _x, y + (2 * w), _x - w, y + w],
      fill: color,
      stroke: 'black',
      strokeWidth: 2,
      closed: true,
      id: id,
      name: data
    });

    // event: delete symbol + keyframe
    poly.on('click', () => {
      poly.destroy();
      if (this.keysDrawn.indexOf(id) !== -1) {
        this.keysDrawn.splice(this.keysDrawn.indexOf(id), 1);
        this.deleteAnimKey(poly.id().replace('oldKey', ''));
      }
      this.showKeyValue(null);
      this.dynamicLayer.draw();
    });
    // event: show tooltip
    poly.on('mouseenter', () => {
      this.showKeyValue(poly.name());
    });
    // event: hide tooltip
    poly.on('mouseleave', () => {
      this.showKeyValue(null);
    });

    this.keysDrawn.push(id);
    this.dynamicLayer.add(poly);
    this.dynamicLayer.draw();
  }

  /**
   * draw pointer
   */
  private drawPointer(): void {
    this.pointer = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.lineWidth,
      height: this.height,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 1,
    });
    // custom hit box is bigger than the standard
    this.pointer.hitFunc((context) => {
      const xStart: number = -(this.distance - 4);
      const xEnd: number = this.pointer.width() + (xStart * (-2));
      context.beginPath();
      context.rect(xStart, 0, xEnd, this.height);
      context.closePath();
      context.fillStrokeShape(this.pointer);
    });
    // event: create key at pointer position
    this.pointer.on('click', () => {
      if (this.mesh === undefined) {
        this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
        return;
      }
      if (this.animation !== undefined) {
        const xPos: number = this.pointer.position().x;
        const data: number[] = [];

        // save the position/rotation/scaling of the mesh
        switch (this.animation.targetProperty) {
          case 'rotation':
            if (this.mesh.rotationQuaternion !== null && this.mesh.rotationQuaternion !== undefined) {
              data[0] = this.mesh.rotationQuaternion.toEulerAngles().x;
              data[1] = this.mesh.rotationQuaternion.toEulerAngles().y;
              data[2] = this.mesh.rotationQuaternion.toEulerAngles().z;
            } else {
              data[0] = this.mesh.rotation.x;
              data[1] = this.mesh.rotation.y;
              data[2] = this.mesh.rotation.z;
            }
            break;
          case 'scaling':
            data[0] = this.mesh.scaling.x;
            data[1] = this.mesh.scaling.y;
            data[2] = this.mesh.scaling.z;
            break;
          default:
            data[0] = this.mesh.position.x;
            data[1] = this.mesh.position.y;
            data[2] = this.mesh.position.z;
            break;
        }
        const dataDisplay: string = '{ X: ' + data[0] + ' Y: ' + data[1] + ' Z: ' + data[2] + ' }';
        this.drawKey(xPos, this.pointer.name(), dataDisplay);
        this.addAnimKey(this.pointer.name(), data);
      } else {
        this.globals.ipcRenderer.send('show-message', 'No animation selected', 'warning');
      }
    });
    // add to layer
    this.dynamicLayer.add(this.pointer);
    this.dynamicLayer.draw();
  }

  /**
   * resize the container and stage
   *  @param {number} _width - new width of stage
   */
  private resizeStage(_width: number): void {
    this.container.setAttribute('style', 'width:' + _width.toString() + 'px;');
    this.width = this.container.clientWidth;
    this.stage.width(this.width);
  }

  /**
   * draw the lines and numbers for the frames
   *  @param {number} _amount - the max frame value
   */
  private drawLines(_amount: number): void {
    let xPos: number = this.startX;
    this.distance = Math.round(this.width / _amount);
    let simpleText: Konva.Text;

    if (this.distance < this.minDistance) {
      this.distance = this.minDistance;
    }

    for (let index = 0; index <= _amount; index++) {
      if (index % 10 === 0) {
        this.linesDrawn[index] = new Konva.Rect({
          x: xPos,
          y: 0,
          width: this.lineWidth,
          height: (this.lineHeight * 0.8),
          fill: 'black',
          stroke: 'black',
          strokeWidth: 1,
        });
        simpleText = new Konva.Text({
          x: xPos,
          y: this.lineHeight - 10,
          text: index.toString(),
          fontSize: 12,
          fontFamily: 'Calibri',
          fill: 'white'
        });
        // text align
        simpleText.offsetX(simpleText.getWidth() / 2);
      } else if (index % 5 === 0) {
        this.linesDrawn[index] = new Konva.Rect({
          x: xPos,
          y: 0,
          width: this.lineWidth,
          height: (this.lineHeight * 0.6),
          fill: 'black',
          stroke: 'black',
          strokeWidth: 1,
        });
      } else {
        this.linesDrawn[index] = new Konva.Rect({
          x: xPos,
          y: 0,
          width: this.lineWidth,
          height: (this.lineHeight * 0.5),
          fill: 'black',
          stroke: 'black',
          strokeWidth: 1,
        });
      }
      // custom hit box: longer than the line itself
      this.linesDrawn[index].hitFunc((context) => {
        context.beginPath();
        context.rect(0, 0, this.lineWidth, this.height);
        context.closePath();
        context.fillStrokeShape(this.linesDrawn[index]);
      });
      // event: pointer saves the frame of the line in the name property
      this.linesDrawn[index].on('mouseover', () => {
        const pos: number = this.linesDrawn[index].position().x;
        this.pointer.x(pos);
        this.pointer.name(index.toString());
        this.dynamicLayer.draw();
      });
      // add to layer
      this.staticLayer.add(simpleText);
      this.staticLayer.add(this.linesDrawn[index]);
      xPos += this.distance;
    }
    // draw layer
    this.staticLayer.draw();

    // check size
    if (xPos > (this.width + this.distance)) {
      this.resizeStage(xPos);
    }
  }

  /**
   * draw the new keys in the timeline
   * @param {number} _x - position the key will be drawn
   * @param {number} _frame - frame of the keyframe
   * @param {number} _data - value of the keyframe
   */
  private drawKey(_x: number, _frame: string, _data: string): void {
    const w = 10;
    const y = 75;
    const color = '#00D2FF';
    const id: string = _frame;
    const data: string = _data;

    // check if key already exists
    // if true create new key and save id in keyArray, else show on top of the layer
    if (this.keysDrawn.indexOf(id) === -1) {
      const poly = new Konva.Line({
        points: [_x, y, _x + w, y + w, _x, y + (2 * w), _x - w, y + w],
        fill: color,
        stroke: 'black',
        strokeWidth: 2,
        closed: true,
        id: id,
        name: data
      });

      // event: show value
      poly.on('mouseenter', () => {
        this.showKeyValue(poly.name());
      });
      // event: hide value
      poly.on('mouseleave', () => {
        this.showKeyValue(null);
      });
      // event: delete symbol + keyframe and hide value
      poly.on('click', () => {
        poly.destroy();
        if (this.keysDrawn.indexOf(id) !== -1) {
          this.keysDrawn.splice(this.keysDrawn.indexOf(id), 1);
          this.deleteAnimKey(poly.id());
        }
        this.showKeyValue(null);
        this.dynamicLayer.draw();
      });
      // add to keysDrawn array
      this.keysDrawn.push(id);
      // add too layer
      this.dynamicLayer.add(poly);
    } else {
      const shape: Konva.Shape = this.stage.find('#' + id)[0];
      shape.moveToTop();
    }
    this.dynamicLayer.draw();
  }

  /**
   * delete drawn keys from the timeline
   * @param {boolean} _deleteAll - true = delete old and new keys from timeline false= only new keys
   */
  private deleteDrawnKeys(_deleteAll: boolean): void {
    let col: Konva.Collection;
    if (_deleteAll) {
      col = this.stage.find('Line');
    } else {
      col = this.dynamicLayer.find('Line');
    }

    col.each((el) => {
      el.destroy();
    });
    this.keysDrawn.length = 0;

    if (_deleteAll) {
      this.staticLayer.draw();
      this.dynamicLayer.draw();
    } else {
      this.dynamicLayer.draw();
    }
  }

  /**
   * add a new keyframe to the animKey array
   * @param {string} _frame - frame of the  new keyframe
   * @param {number[]} _values - value of the new keyframe
   */
  private addAnimKey(_frame: string, _values: number[]): void {
    const frame: number = parseInt(_frame, 10);
    const value: BABYLON.Vector3 = new BABYLON.Vector3(_values[0], _values[1], _values[2]);
    // delete the old entry if frame already exists in array
    for (let i = 0; i < this.animKeys.length; i++) {
      if (this.animKeys[i].frame === frame) {
        this.animKeys.splice(i, 1);
      }
    }
    this.animKeys.push({
      frame: frame,
      value: value
    });
  }

  /**
   * delete keyframe from animKey array
   * @param {string} _frame - frame of the keyframe
   */
  private deleteAnimKey(_frame: string): void {
    const frame: number = parseInt(_frame, 10);
    for (let i = 0; i < this.animKeys.length; i++) {
      if (this.animKeys[i].frame === frame) {
        this.animKeys.splice(i, 1);
      }
    }
  }

  /**
   * draw a horizontal line
   * @param {number} _y - y position of the line
   */
  private drawHorizontalLine(_y: number): void {
    const line: Konva.Rect = new Konva.Rect({
      x: 0,
      y: _y,
      width: this.width,
      stroke: 'black',
      strokeWidth: 3,
      opacity: 0.7
    });
    this.staticLayer.add(line);
    line.moveToBottom();
    this.staticLayer.draw();
  }

  /**
   * show the value of selected keyframe in the infobox
   * @param {string} _content - value of the keyframe
   */
  private showKeyValue(_content: string): void {
    if (_content === null) {
      document.getElementById('timelineValue').innerHTML = 'value: -';
    } else {
      document.getElementById('timelineValue').innerHTML = 'value: ' + _content;
    }
  }
}
