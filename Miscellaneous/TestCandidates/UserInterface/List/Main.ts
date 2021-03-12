namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  let details: ƒUi.DetailsArray = <ƒUi.DetailsArray>ƒUi.Generator.createDetailsFromMutable(data, "Vectors");
  let cntDetails: ƒUi.Controller = new ƒUi.Controller(data, details);
  document.body.appendChild(details);
  ƒUi.Controller.updateUserInterface(data, details);
  details.addEventListener(ƒUi.EVENT.INPUT, hndInput);

  function hndInput(_event: Event): void {
    let mutator: ƒ.Mutator = details.getMutator();
    data.mutate(mutator);
    cntDetails.updateUserInterface()
    console.log(data);
  }
}