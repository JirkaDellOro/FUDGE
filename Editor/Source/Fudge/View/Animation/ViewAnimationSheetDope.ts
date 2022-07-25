namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimationSheetDope extends ViewAnimationSheet {
    async drawKeys(): Promise<void> {
      //TODO: Fix that for some reason the first time this is called the rects return all 0s.
      //TODO: possible optimisation: only regenerate if necessary, otherwise load a saved image. (might lead to problems with the keys not being clickable anymore though)
      // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      // let inputMutator: ƒ.Mutator = this.view.controller.getElementIndex();
      // console.log(inputMutator);
      // await delay(1);
      // console.log(inputMutator.components["ComponentTransform"][0]["ƒ.ComponentTransform"]["rotation"]["y"].getBoundingClientRect());
      // }, 1000);
      // this.traverseStructures(this.view.animation.animationStructure, inputMutator);

      this.drawKey(100, 100, 10, 10, "green");
      // this.drawStructure(this.animation.animationStructure);
    }

    protected drawSequence(_sequence: ƒ.AnimationSequence): void {
      let rect: DOMRect | ClientRect = new DOMRect(100, 100, 10, 10); //_input.getBoundingClientRect();
      let y: number = rect.top - this.dom.getBoundingClientRect().top + rect.height / 2;
      let height: number = rect.height;
      let width: number = rect.height;
      let line: Path2D = new Path2D();
      line.moveTo(0, y);
      line.lineTo(this.crc2.canvas.width, y);
      this.crc2.strokeStyle = "green";
      this.crc2.stroke(line);
      let seq: ViewAnimationSequence = { color: "red", sequence: _sequence };
      this.sequences.push(seq);

      for (let i: number = 0; i < _sequence.length; i++) {
        let k: ƒ.AnimationKey = _sequence.getKey(i);
        this.keys.push({ key: k, path2D: this.drawKey(k.Time * this.transform.scaling.x, y, height / 2, width / 2, seq.color), sequence: seq });
      }
    }
  }
}