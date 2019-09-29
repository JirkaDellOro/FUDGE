namespace Fudge {
  /**
   * Dopesheet Visualisation of an Animation for the Animation Editor.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class ViewAnimationSheetDope extends ViewAnimationSheet {

    protected drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void {
      let rect: DOMRect | ClientRect = _input.getBoundingClientRect();
      let y: number = rect.top - this.view.content.getBoundingClientRect().top + rect.height / 2;
      let height: number = rect.height;
      let width: number = rect.height / this.scale.x;
      let line: Path2D = new Path2D();
      line.moveTo(0, y);
      line.lineTo(10000, y);
      this.crc2.strokeStyle = "black";
      this.crc2.stroke(line);
      let seq: ViewAnimationSequence = { color: "red", element: _input, sequence: _sequence };
      this.sequences.push(seq);

      for (let i: number = 0; i < _sequence.length; i++) {
        let k: FudgeCore.AnimationKey = _sequence.getKey(i);
        this.keys.push({ key: k, path2D: this.drawKey(k.Time, y, height / 2, width / 2, seq.color), sequence: seq });
      }
    }
  }
}