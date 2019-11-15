namespace CustomEventTest {
  class myEvent extends Event {
    affectedObject: any;
    affectedType: string;
  }

  class myThing {
    foo: number;
    bar: string;
  }

  document.addEventListener("mutate", catchMyEvent);
  document.addEventListener("mutate2", catchCustomEvent);

  let thing: myThing = new myThing();
  thing.foo = 42;
  thing.bar = "yes";
  let ev: myEvent = new myEvent("mutate");
  ev.affectedObject = thing;
  ev.affectedType = thing.constructor.name;

  let ce: CustomEvent = new CustomEvent("mutate2", {detail: thing});
  document.dispatchEvent(ev);
  document.dispatchEvent(ce);

  function catchMyEvent(_e: Event) {
    // let obj: any = (<myEvent>_e).affectedObject;
    if ((<myEvent>_e).affectedObject instanceof myThing) console.log("yes");
    // console.log(_e);
    // console.log(obj);
  }

  function catchCustomEvent(_e: Event) {
    console.log((<CustomEvent>_e).detail);
  }
}