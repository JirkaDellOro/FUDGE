/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;
    export abstract class MutableUI {
        protected updateInterval:number = 30;

        protected abstract root: HTMLElement;
        protected abstract mutable:ƒ.Mutable;
        protected abstract mutator:ƒ.Mutator;

        constructor() {
            window.setInterval(this.updateMutator, this.updateInterval);
        }
        protected resetUpdateInterval()
        {
            window.clearInterval();
            window.setInterval(this.updateMutator, this.updateInterval);
        }

        protected abstract updateUI(e: Event)

        protected abstract updateMutator(e:Event)

        abstract fillById(mutator:ƒ.Mutator)
        abstract obtainMutator()
        
    }

}