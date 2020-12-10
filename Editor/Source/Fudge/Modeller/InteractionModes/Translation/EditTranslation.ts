namespace Fudge {
  import ƒAid = FudgeAid;
  export class EditTranslation extends AbstractTranslation {
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode);
      this.initialize();
    }
  }
}