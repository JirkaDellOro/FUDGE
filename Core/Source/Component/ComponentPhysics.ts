/// <reference path="Component.ts"/>
/// <reference types="./Oimo"/>

namespace FudgeCore {

  /** 
     * Attaches Oimojs Physics Engine to a Node.
     * @authors Vladimir Matern, HFU, 2019
     */
    export class ComponentPhysics extends Component {
        public local: Matrix4x4;
        public rigidBody: RigidBody |null;
        public aabb: Aabb |null;
        public world:World;
        public broadPhaseType:BroadPhaseType;
        public gravity:Vector3;
        

        public constructor(_matrix: Matrix4x4 = Matrix4x4.IDENTITY){
            super();
            this.local = _matrix;

        }

        public setRigidbody(_RigidBody:RigidBody){
            this.rigidBody = _RigidBody;
        }

        public getRigidbody():RigidBody{
            return this.rigidBody;
        }

        public setGravity(_gravity:Vector3){
            this.gravity = _gravity;
        }

        public getGravity():Vector3{
            return this.gravity;
        }


       public setAabb(_Aabb:Aabb){
           this.aabb = _Aabb;
       }
       public getAabb():Aabb{
           return this.aabb;
       }

       public createPhysicsWorld(_broadPhaseType?:number,_Gravity?:Vector3):World{
           this.broadPhaseType = _broadPhaseType;
           this.gravity = _Gravity;
           return this.world;

       }

       //#region Transfer
       public serialize(): Serialization {
        let serialization: Serialization = {
            rigidBody: this.rigidBody,
            aabb: this.aabb,
            world: this.world,
            broadPhaseType: this.broadPhaseType,
            gravity: this.gravity,
            [super.constructor.name]: super.serialize()
        };
        return serialization;
    }

    public deserialize(_serialization: Serialization): Serializable {
        this.rigidBody = _serialization.rigidBody;
        this.aabb = _serialization.aabb;
        this.world = _serialization.world;
        this.broadPhaseType = _serialization.broadPhaseType;
        this.gravity = _serialization.gravity;    
        super.deserialize(_serialization[super.constructor.name]);
        
        return this;
    }
    protected reduceMutator(_mutator: Mutator): void {
        delete _mutator.world;
        super.reduceMutator(_mutator);
    }
    }
}