namespace Fudge {
  export class ViewAnimationSheetDope extends ViewAnimationSheet {
    async drawKeys(): Promise<void> {
      //TODO: Fix that for some reason the first time this is called the rects return all 0s.
      //TODO: possible optimisation: only regenerate if necessary, otherwise load a saved image. (might lead to problems with the keys not being clickable anymore though)
      // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      let inputMutator: FudgeCore.Mutator = this.view.controller.getElementIndex();
      // console.log(inputMutator);
      // await delay(1);
      // console.log(inputMutator.components["ComponentTransform"][0]["ƒ.ComponentTransform"]["rotation"]["y"].getBoundingClientRect());
      // }, 1000);
      this.traverseStructures(this.view.animation.animationStructure, inputMutator);
    }

    protected drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void {
      let rect: DOMRect | ClientRect = _input.getBoundingClientRect();
      let y: number = rect.top - this.view.dom.getBoundingClientRect().top + rect.height / 2;
      let height: number = rect.height;
      let width: number = rect.height;
      let line: Path2D = new Path2D();
      line.moveTo(0, y);
      line.lineTo(this.crc2.canvas.width, y);
      this.crc2.strokeStyle = "black";
      this.crc2.stroke(line);
      let seq: ViewAnimationSequence = { color: "red", element: _input, sequence: _sequence };
      this.sequences.push(seq);

      for (let i: number = 0; i < _sequence.length; i++) {
        let k: FudgeCore.AnimationKey = _sequence.getKey(i);
        this.keys.push({ key: k, path2D: this.drawKey(k.Time * this.scale.x, y, height / 2, width / 2, seq.color), sequence: seq });
      }
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