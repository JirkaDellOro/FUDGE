/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
namespace FudgeCore {
    /** 
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Component extends Mutable implements Serializable {
        protected singleton: boolean = true;
        private container: Node | null = null;
        private active: boolean = true;

        public activate(_on: boolean): void {
            this.active = _on;
            this.dispatchEvent(new Event(_on ? EVENT.COMPONENT_ACTIVATE : EVENT.COMPONENT_DEACTIVATE));
        }
        public get isActive(): boolean {
            return this.active;
        }

        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        public get isSingleton(): boolean {
            return this.singleton;
        }
        /**
         * Retrieves the node, this component is currently attached to
         * @returns The container node or null, if the component is not attached to
         */
        public getContainer(): Node | null {
            return this.container;
        }
        /**
         * Tries to add the component to the given node, removing it from the previous container if applicable
         * @param _container The node to attach this component to
         */
        public setContainer(_container: Node | null): void {
            if (this.container == _container)
                return;
            let previousContainer: Node = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                if (this.container)
                    this.container.addComponent(this);
            } catch {
                this.container = previousContainer;
            }
        }
        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = {
                active: this.active
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.active = _serialization.active;
            return this;
        }

        protected reduceMutator(_mutator: Mutator): void {
            delete _mutator.singleton;
            delete _mutator.container;
        }
        //#endregion
    }
}