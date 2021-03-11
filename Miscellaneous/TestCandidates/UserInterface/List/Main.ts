namespace ListControl {
  // import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  // let list: ƒUi.DetailsArray = new ƒUi.DetailsArray("Vectors");
  // document.body.appendChild(list);
  // ƒUi.Controller.updateUserInterface(data, list);
  let details: ƒUi.DetailsArray = <ƒUi.DetailsArray>ƒUi.Generator.createDetailsFromMutable(data, "Vectors");
  details.addEventListener("input", hndInput);
  document.body.appendChild(details);

  function hndInput(_event: Event): void {
    let mutator: ƒ.Mutator = details.getMutator();
    data.mutate(mutator);
    console.log(data);
  }
}