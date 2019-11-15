"use strict";
var CustomEventTest;
(function (CustomEventTest) {
    class myEvent extends Event {
    }
    class myThing {
    }
    document.addEventListener("mutate", catchMyEvent);
    document.addEventListener("mutate2", catchCustomEvent);
    let thing = new myThing();
    thing.foo = 42;
    thing.bar = "yes";
    let ev = new myEvent("mutate");
    ev.affectedObject = thing;
    ev.affectedType = thing.constructor.name;
    let ce = new CustomEvent("mutate2", { detail: thing });
    document.dispatchEvent(ev);
    document.dispatchEvent(ce);
    function catchMyEvent(_e) {
        // let obj: any = (<myEvent>_e).affectedObject;
        if (_e.affectedObject instanceof myThing)
            console.log("yes");
        // console.log(_e);
        // console.log(obj);
    }
    function catchCustomEvent(_e) {
        console.log(_e.detail);
    }
})(CustomEventTest || (CustomEventTest = {}));
//# sourceMappingURL=CustomEvent.js.map