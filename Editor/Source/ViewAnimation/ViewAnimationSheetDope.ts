namespace Fudge {
  export class ViewAnimationSheetDope extends ViewAnimationSheet {
    async drawKeys(): Promise<void> {

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      let inputMutator: FudgeCore.Mutator = this.view.controller.getElementIndex();
      // console.log(inputMutator);
      await delay(1);
      // console.log(inputMutator.components["ComponentTransform"][0]["ƒ.ComponentTransform"]["rotation"]["y"].getBoundingClientRect());
      // }, 1000);
      this.traverseStructures(this.view.animation.animationStructure, inputMutator);
    }

    private traverseStructures(_animation: FudgeCore.AnimationStructure, _inputs: FudgeCore.Mutator): void {
      for (let i in _animation) {
        if (_animation[i] instanceof FudgeCore.AnimationSequence) {
          this.drawSequence(<FudgeCore.AnimationSequence>_animation[i], <HTMLInputElement>_inputs[i]);
        } else {
          this.traverseStructures(<FudgeCore.AnimationStructure>_animation[i], <FudgeCore.Mutator>_inputs[i]);
        }
      }
    }

    private drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void {
      let rect: DOMRect | ClientRect = _input.getBoundingClientRect();
      let y: number = rect.top - this.view.content.getBoundingClientRect().top + rect.height / 2;
      let height: number = rect.height;
      let width: number = rect.height;
      let line: Path2D = new Path2D();
      line.moveTo(0, y);
      line.lineTo(this.crc2.canvas.width, y);
      this.crc2.strokeStyle = "black";
      this.crc2.stroke(line);
      console.log("sequence", _sequence);

      for (let i: number = 0; i < _sequence.length; i++) {
        let k: FudgeCore.AnimationKey = _sequence.getKey(i);
        console.log(k);
        this.keys.push({ key: k, path2D: this.drawKey(k.Time * this.scale.x, y, height / 2, width / 2), sequence: { sequence: _sequence, element: _input } });
      }
    }

    private drawKey(_x: number, _y: number, _h: number, _w: number): Path2D {
      let key: Path2D = new Path2D();
      key.moveTo(_x - _w, _y);
      key.lineTo(_x, _y + _h);
      key.lineTo(_x + _w, _y);
      key.lineTo(_x, _y - _h);
      key.closePath();

      this.crc2.fillStyle = "red";
      this.crc2.strokeStyle = "black";
      this.crc2.lineWidth = 1;
      this.crc2.fill(key);
      this.crc2.stroke(key);
      return key;
    }

    // private tempGetInputMutator(): FudgeCore.Mutator {
    //   let y1: HTMLElement = document.createElement("li");
    //   let y2: HTMLElement = document.createElement("li");
    //   this.view.content.appendChild(y1);
    //   this.view.content.appendChild(y2);
    //   return {
    //     components: {
    //       ComponentTransform: [
    //         {
    //           "ƒ.ComponentTransform": {
    //             position: {
    //               x: document.createElement("li"),
    //               y: y1,
    //               z: document.createElement("li")
    //             },
    //             rotation: {
    //               x: document.createElement("li"),
    //               y: y2,
    //               z: document.createElement("li")
    //             }
    //           }
    //         }
    //       ]
    //     }
    //   };
    // }
  }
}