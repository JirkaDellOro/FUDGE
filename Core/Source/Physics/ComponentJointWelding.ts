namespace FudgeCore {
    /**
       * A physical connection between two bodies with no movement. 
       * Best way to simulate convex objects like a char seat connected to chair legs.
       * The actual anchor point does not matter that much, only in very specific edge cases.
       * Because welding means they simply do not disconnect. (unless you add Breakability)
       * @author Marko Fehrenbach, HFU 2020
       */
    export class ComponentJointWelding extends ComponentJoint {
        public static readonly iSubclass: number = Component.registerSubclass(ComponentJointWelding);

        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
          * On a welding joint the connected bodies should not be colliding with each other,
          * for best results
         */
        get internalCollision(): boolean {
            return this.jointInternalCollision;
        }
        set internalCollision(_value: boolean) {
            this.jointInternalCollision = _value;
            if (this.oimoJoint != null) this.oimoJoint.setAllowCollision(this.jointInternalCollision);
        }

        /**
 * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default) 
*/
        get breakForce(): number {
            return this.jointBreakForce;
        }
        set breakForce(_value: number) {
            this.jointBreakForce = _value;
            if (this.oimoJoint != null) this.oimoJoint.setBreakForce(this.jointBreakForce);
        }

        /**
           * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default) 
          */
        get breakTorque(): number {
            return this.jointBreakTorque;
        }
        set breakTorque(_value: number) {
            this.jointBreakTorque = _value;
            if (this.oimoJoint != null) this.oimoJoint.setBreakTorque(this.jointBreakTorque);
        }


        /**
         * The exact position where the two {@link Node}s are connected. When changed after initialization the joint needs to be reconnected.
         */
        get anchor(): Vector3 {
            return new Vector3(this.jointAnchor.x, this.jointAnchor.y, this.jointAnchor.z);
        }
        set anchor(_value: Vector3) {
            this.jointAnchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }

        private jointAnchor: OIMO.Vec3;
        private jointInternalCollision: boolean = false;

        private jointBreakForce: number = 0;
        private jointBreakTorque: number = 0;

        private config: OIMO.GenericJointConfig = new OIMO.GenericJointConfig();

        private oimoJoint: OIMO.GenericJoint;

        constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
            super(_attachedRigidbody, _connectedRigidbody);

            this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

            /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
              actual constraint ain't existent until the game starts
            */
            this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
            this.addEventListener(EVENT.COMPONENT_REMOVE, this.superRemove);
        }


        /**
         * Initializing and connecting the two rigidbodies with the configured joint properties
         * is automatically called by the physics system. No user interaction needed.
         */
        public connect(): void {
            if (this.connected == false) {
                this.constructJoint();
                this.connected = true;
                this.superAdd();
            }
        }

        /**
         * Disconnecting the two rigidbodies and removing them from the physics system,
         * is automatically called by the physics system. No user interaction needed.
         */
        public disconnect(): void {
            if (this.connected == true) {
                this.superRemove();
                this.connected = false;
            }
        }

        /**
         * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
         * Only to be used when functionality that is not added within Fudge is needed.
        */
        public getOimoJoint(): OIMO.Joint {
            return this.oimoJoint;
        }

        //#endregion

        protected dirtyStatus(): void {
            Physics.world.changeJointStatus(this);
        }

        private constructJoint(): void {

            this.config = new OIMO.GenericJointConfig();
            let attachedRBPos: Vector3 = this.attachedRigidbody.node.mtxWorld.translation;
            let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
            this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, new OIMO.Mat3(), new OIMO.Mat3());


            var j: OIMO.GenericJoint = new OIMO.GenericJoint(this.config);
            j.setAllowCollision(this.jointInternalCollision);

            this.oimoJoint = j;
        }

        private superAdd(): void {
            this.addConstraintToWorld(this);
        }

        private superRemove(): void {
            this.removeConstraintFromWorld(this);
        }


        //#region Saving/Loading
        public serialize(): Serialization {
            let serialization: Serialization = {
                attID: super.idAttachedRB,
                conID: super.idConnectedRB,
                anchor: this.anchor,
                internalCollision: this.jointInternalCollision,
                breakForce: this.jointBreakForce,
                breakTorque: this.jointBreakTorque,

                [super.constructor.name]: super.baseSerialize()
            };
            return serialization;
        }

        public async deserialize(_serialization: Serialization): Promise<Serializable> {
            super.idAttachedRB = _serialization.attID;
            super.idConnectedRB = _serialization.conID;
            if (_serialization.attID != null && _serialization.conID != null)
                super.setBodiesFromLoadedIDs();
            this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
            this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
            this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
            this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
            super.baseDeserialize(_serialization);
            return this;
        }
        //#endregion
    }
}