namespace genStruct {

  import ƒ = Fudge;
  document.addEventListener("DOMContentLoaded", init);

  let crc: CanvasRenderingContext2D;
  let mutator: ƒ.Mutator;

  function init(): void {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementsByTagName("canvas")[0];
    crc = canvas.getContext("2d");
    crc.strokeStyle = "#000";
    crc.lineWidth = 2;
    Scenes.createMiniScene();
    mutator = Scenes.node.cmpTransform.getMutatorForAnimation();
    Scenes.node.cmpTransform.getMutatorAttributeTypes(mutator);
    getObjectStructure(mutator);
  }

  function getObjectStructure(_obj: ƒ.Mutator): void {
    for (let key in _obj) {
      let value: Object = _obj[key];
      console.log(key, value);
    }
  }
}