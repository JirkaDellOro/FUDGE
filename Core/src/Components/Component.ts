/// <reference path="../Engine/Serializer.ts"/>
namespace Fudge {
    /** 
     * Superclass for all [[Component]]s that can be attached to [[Nodes]].
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Component implements Serializable {
        private container: Node | null = null;
        private singleton: boolean = true;
        private active: boolean = true;

        public activate(_on: boolean): void {
            this.active = _on;
        }
        public get isActive(): boolean {
            return this.active;
        }

        /**
         * Retrieves the type of this components subclass as the name of the runtime class
         * @returns The type of the component
         */
        public get type(): string {
            return this.constructor.name;
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
         * TODO: write tests to prove consistency and correct exception handling
         */
        public setContainer(_container: Node | null): void {
            if (this.container == _container)
                return;
            let previousContainer: Node = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                this.container.addComponent(this);
            } catch {
                this.container = previousContainer;
            }
        }

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
    }
}