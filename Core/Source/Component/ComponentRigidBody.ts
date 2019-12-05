/// <reference path="Component.ts"/>
/// <reference path="../Physics/Oimo.d.ts"/>


namespace FudgeCore {


    export class ComponentRigidBody extends Component {
        private static readonly _config: RigidBodyConfig = new RigidBodyConfig();

        public _linearVelocity: Vector3;
        public _angularVelocity: Vector3;
        public _linearDamping: number = 1;
        public _angularDamping: number = 1
        rigidBody: RigidBody | null = null;
        public _type: number = 0;


        constructor() {
            super();

        }


        public createRigidBody() {
            const config = new RigidBodyConfig;
            config.type = this._type;
            config.linearDamping = this._linearDamping;
            config.angularDamping = this._angularDamping;
            config.linearVelocity = this._linearVelocity as any; // 
            config.angularVelocity = this._angularVelocity as any; // 

            this.rigidBody = new RigidBody(config);

            this.rigidBody.userData = this;

            return this.rigidBody;
        }

        public getRigidBody() {
            return this.rigidBody;
        }

        public applyForce(force: Vec3, positionInWorld: Vec3) {
            return this.rigidBody.applyForce(force, positionInWorld);
        }
        public applyImpulse(Impulse: Vec3, positionInWorld: Vec3) {
            return this.rigidBody.applyImpulse(Impulse, positionInWorld);
        }


    }
}
