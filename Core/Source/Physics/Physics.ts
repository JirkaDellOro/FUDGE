///<reference path="../../../Physics/OIMOPhysics.d.ts"/>

namespace FudgeCore {

  /**
    * Main Physics Class to hold information about the physical representation of the scene
    * @author Marko Fehrenbach, HFU 2020
    */
  export class Physics {

    /** The PHYSICAL WORLD that gives every {@link Node} with a ComponentRigidbody a physical representation and moves them accordingly to the laws of the physical world. */
    public static world: Physics = Physics.initializePhysics();
    /** The SETTINGS that apply to the physical world. Ranging from things like sleeping, collisionShapeThickness and others */
    public static settings: PhysicsSettings;

    /** The rendering of physical debug informations. Used internally no interaction needed.*/
    public debugDraw: PhysicsDebugDraw;
    /** The camera/viewport the physics are debugged to. Used internally no interaction needed. */
    public mainCam: ComponentCamera;

    private oimoWorld: OIMO.World;
    private bodyList: ComponentRigidbody[] = new Array();
    private triggerBodyList: ComponentRigidbody[] = new Array();
    private jointList: ComponentJoint[] = new Array();

    /**
     * Creating a physical world to represent the {@link Node} Scene Tree. Call once before using any physics functions or
     * rigidbodies.
     */
    public static initializePhysics(): Physics {
      if (typeof OIMO !== "undefined" && this.world == null) { //Check if OIMO Namespace was loaded, else do not use any physics. Check is needed to ensure FUDGE can be used without Physics
        this.world = new Physics();
        this.settings = new PhysicsSettings(PHYSICS_GROUP.DEFAULT, (PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 | PHYSICS_GROUP.GROUP_2 | PHYSICS_GROUP.GROUP_3 | PHYSICS_GROUP.GROUP_4));
        this.world.createWorld(); //create the actual oimoPhysics World
        this.world.debugDraw = new PhysicsDebugDraw();  //Create a Fudge Physics debugging handling object
        this.world.oimoWorld.setDebugDraw(this.world.debugDraw.oimoDebugDraw); //Tell OimoPhysics where to debug to and how it will be handled
      }
      return this.world;
    }

    /**
    * Cast a RAY into the physical world from a origin point in a certain direction. Receiving informations about the hit object and the
    * hit point. Do not specify a _group to raycast the whole world, else only bodies within the specific group can be hit.
    */
    public static raycast(_origin: Vector3, _direction: Vector3, _length: number = 1, _group: PHYSICS_GROUP = PHYSICS_GROUP.DEFAULT): RayHitInfo {
      let hitInfo: RayHitInfo = new RayHitInfo();
      let ray: OIMO.RayCastClosest = new OIMO.RayCastClosest();
      let begin: OIMO.Vec3 = new OIMO.Vec3(_origin.x, _origin.y, _origin.z);
      let end: OIMO.Vec3 = this.getRayEndPoint(begin, new Vector3(_direction.x, _direction.y, _direction.z), _length);
      ray.clear();
      if (_group == PHYSICS_GROUP.DEFAULT) { //Case 1: Raycasting the whole world, normal mode
        Physics.world.oimoWorld.rayCast(begin, end, ray);
      } else { //Case2: Raycasting on each body in a specific group
        let allHits: RayHitInfo[] = new Array();
        this.world.bodyList.forEach(function (value: ComponentRigidbody): void {
          if (value.collisionGroup == _group) {
            hitInfo = value.raycastThisBody(_origin, _direction, _length);
            if (hitInfo.hit == true) { //Every hit is could potentially be the closest
              allHits.push(hitInfo);
            }
          }
        });
        allHits.forEach(function (value: RayHitInfo): void { //get the closest hitInfo
          if (value.hitDistance < hitInfo.hitDistance || hitInfo.hit == false) {
            hitInfo = value;
          }
        });
      }
      if (ray.hit) { //Fill in informations on the hit
        hitInfo.hit = true;
        hitInfo.hitPoint = new Vector3(ray.position.x, ray.position.y, ray.position.z);
        hitInfo.hitNormal = new Vector3(ray.normal.x, ray.normal.y, ray.normal.z);
        hitInfo.hitDistance = this.getRayDistance(_origin, hitInfo.hitPoint);
        hitInfo.rigidbodyComponent = ray.shape.userData;
        hitInfo.rayEnd = new Vector3(end.x, end.y, end.z);
        hitInfo.rayOrigin = _origin;
      } else {
        hitInfo.rayOrigin = _origin;
        hitInfo.hitPoint = new Vector3(end.x, end.y, end.z);
      }
      if (Physics.settings.debugDraw) { //Handle debugging
        Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new Color(0, 1, 0, 1));
      }
      return hitInfo;
    }


    /**
      * Adjusts the transforms of the {@link ComponentRigidbody}s in the given branch to match their nodes or meshes
      */
    public static adjustTransforms(_branch: Node, _toMesh: boolean = false): void {
      Render.prepare(_branch, { ignorePhysics: true });
      for (let node of Render.nodesPhysics)
        node.getComponent(ComponentRigidbody).updateFromWorld(_toMesh);
      // this.world.updateWorldFromWorldMatrix(_toMesh);
      // for (let body of this.world.bodyList)
      //   body.updateFromWorld(_toMesh);
    }

    /** Internal function to calculate the endpoint of mathematical ray. By adding the multiplied direction to the origin. 
       * Used because OimoPhysics defines ray by start/end. But GameEngines commonly use origin/direction.
       */
    private static getRayEndPoint(start: OIMO.Vec3, direction: Vector3, length: number): OIMO.Vec3 {
      let origin: Vector3 = new Vector3(start.x, start.y, start.z);
      let scaledDirection: Vector3 = direction;
      scaledDirection.scale(length);
      let endpoint: Vector3 = Vector3.SUM(scaledDirection, origin);
      return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
    }

    /** Internal function to get the distance in which a ray hit by subtracting points from each other and get the square root of the squared product of each component. */
    private static getRayDistance(origin: Vector3, hitPoint: Vector3): number {
      let dx: number = origin.x - hitPoint.x;
      let dy: number = origin.y - hitPoint.y;
      let dz: number = origin.z - hitPoint.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /** Returns all the ComponentRigidbodies that are known to the physical space. */
    public getBodyList(): ComponentRigidbody[] {
      return this.bodyList;
    }

    /** Returns all the ComponentRigidbodies that are in the specific group of triggers. */
    public getTriggerList(): ComponentRigidbody[] {
      return this.triggerBodyList;
    }

    /**
    * Getting the solver iterations of the physics engine. Higher iteration numbers increase accuracy but decrease performance
    */
    public getSolverIterations(): number {
      return Physics.world.oimoWorld.getNumPositionIterations();
    }

    /**
    * Setting the solver iterations of the physics engine. Higher iteration numbers increase accuracy but decrease performance
    */
    public setSolverIterations(_value: number): void {
      Physics.world.oimoWorld.setNumPositionIterations(_value);
      Physics.world.oimoWorld.setNumVelocityIterations(_value);
    }

    /**
    * Get the applied gravitational force to physical objects. Default earth gravity = 9.81 m/s
    */
    public getGravity(): Vector3 {
      let tmpVec: OIMO.Vec3 = Physics.world.oimoWorld.getGravity();
      return new Vector3(tmpVec.x, tmpVec.y, tmpVec.z);
    }

    /**
    * Set the applied gravitational force to physical objects. Default earth gravity = 9.81 m/s
    */
    public setGravity(_value: Vector3): void {
      let tmpVec: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      Physics.world.oimoWorld.setGravity(tmpVec);
    }

    /**
    * Adding a new OIMO Rigidbody to the OIMO World, happens automatically when adding a FUDGE Rigidbody Component
    */
    public addRigidbody(_cmpRB: ComponentRigidbody): void {
      this.bodyList.push(_cmpRB);
      Physics.world.oimoWorld.addRigidBody(_cmpRB.getOimoRigidbody());
    }

    /**
    * Removing a OIMO Rigidbody to the OIMO World, happens automatically when removing a FUDGE Rigidbody Component
    */
    public removeRigidbody(_cmpRB: ComponentRigidbody): void {
      let id: number = this.bodyList.indexOf(_cmpRB);
      this.bodyList.splice(id, 1);
      Physics.world.oimoWorld.removeRigidBody(_cmpRB.getOimoRigidbody());
    }

    /**
    * Adding a new OIMO Joint/Constraint to the OIMO World, happens automatically when adding a FUDGE Joint Component
    */
    public addJoint(_cmpJoint: ComponentJoint): void {
      Physics.world.oimoWorld.addJoint(_cmpJoint.getOimoJoint());
    }

    /**
      * Removing a OIMO Joint/Constraint to the OIMO World, happens automatically when removeing a FUDGE Joint Component
      */
    public removeJoint(_cmpJoint: ComponentJoint): void {
      Physics.world.oimoWorld.removeJoint(_cmpJoint.getOimoJoint());
    }

    /** Returns the actual used world of the OIMO physics engine. No user interaction needed.*/
    public getOimoWorld(): OIMO.World {
      return this.oimoWorld;
    }

    /**
    * Simulates the physical world. _deltaTime is the amount of time between physical steps, default is 60 frames per second ~17ms
    */
    public simulate(_deltaTime: number = 1 / 60): void {
      if (this.jointList.length > 0)
        this.connectJoints(); //Connect joints if anything has happened between the last call to any of the two paired rigidbodies
      if (Time.game.getScale() != 0) //If time is stopped do not simulate to avoid misbehaviour
        Physics.world.oimoWorld.step(_deltaTime * Time.game.getScale());  //Update the simulation by the given deltaTime and the Fudge internal TimeScale
    }

    public draw(_cmpCamera: ComponentCamera): void {
      Physics.world.debugDraw.getDebugModeFromSettings();
      Physics.world.mainCam = _cmpCamera;
      Physics.world.oimoWorld.debugDraw(); //Filling the physics world debug informations into the debug rendering handler
      Physics.world.debugDraw.drawBuffers();
      Physics.world.debugDraw.clearBuffers();  //Updates info about the current projection, resetting the points/lines/triangles that need to be drawn from debug
    }

    /** Make the given ComponentRigidbody known to the world as a body that is not colliding, but only triggering events. Used internally no interaction needed. */
    public registerTrigger(_rigidbody: ComponentRigidbody): void {
      if (this.triggerBodyList.indexOf(_rigidbody) == -1)
        this.triggerBodyList.push(_rigidbody);
    }

    /** Remove the given ComponentRigidbody the world as viable triggeringBody. Used internally no interaction needed. */
    public unregisterTrigger(_rigidbody: ComponentRigidbody): void {
      let id: number = this.bodyList.indexOf(_rigidbody);
      this.bodyList.splice(id, 1);
    }

    /** Connect all joints that are not connected yet. Used internally no user interaction needed. This functionality is called and needed to make sure joints connect/disconnect
     * if any of the two paired ComponentRigidbodies change.
     */
    public connectJoints(): void { //Try to connect dirty joints until they are connected
      let jointsToConnect: ComponentJoint[] = new Array(); //Copy original Array because removing/readding in the connecting process
      this.jointList.forEach(function (value: ComponentJoint): void {
        jointsToConnect.push(value);
      });
      this.jointList.splice(0, this.jointList.length);
      jointsToConnect.forEach((value: ComponentJoint): void => {
        if (value.checkConnection() == false) {
          value.connect();
        }
      });
    }

    /**
    * Called internally to inform the physics system that a joint has a change of core properties like ComponentRigidbody and needs to
    * be recreated.
    */
    public changeJointStatus(_cmpJoint: ComponentJoint): void {
      this.jointList.push(_cmpJoint);
    }

    /** Giving a ComponentRigidbody a specific identification number so it can be referenced in the loading process. And removed rb's can receive a new id. */
    public distributeBodyID(): number {
      let freeId: number = 0;
      let free: boolean = false;
      this.bodyList.forEach((_value: ComponentRigidbody): void => {
        if (_value.id != freeId) {
          free = true;
        } else {
          free = false;
        }
        if (!free) {
          freeId++;
        }
      }
      );
      return freeId;
    }

    /** Returns the ComponentRigidbody with the given id. Used internally to reconnect joints on loading in the editor. */
    public getBodyByID(_id: number): ComponentRigidbody {
      let body: ComponentRigidbody = null;
      this.bodyList.forEach((value: ComponentRigidbody): void => {
        if (value.id == _id) {
          body = value;
        }
      });
      return body;
    }

    /** Updates all {@link Rigidbodies} known to the Physics.world to match their containers or meshes transformations */
    // private updateWorldFromWorldMatrix(_toMesh: boolean = false): void {
    //   for (let body of this.bodyList)
    //     body.updateFromWorld(_toMesh);
    // }

    /** Create a oimoPhysics world. Called once at the beginning if none is existend yet. */
    private createWorld(): void {
      if (Physics.world.oimoWorld != null) {
        //Resetting the world so a new world can be created, fix for re-opening a project in editor, making sure there are no old things calculated
        let jointsWorld: number = Physics.world.oimoWorld.getNumJoints();
        let bodiesWorld: number = Physics.world.oimoWorld.getNumRigidBodies();
        this.bodyList = null;
        this.jointList = null;
        this.triggerBodyList = null;
        for (let i: number = 0; i < jointsWorld; i++) {
          Physics.world.oimoWorld.removeJoint(Physics.world.oimoWorld.getJointList());
        }
        for (let i: number = 0; i < bodiesWorld; i++) {
          Physics.world.oimoWorld.removeRigidBody(Physics.world.oimoWorld.getRigidBodyList());
        }
      }
      Physics.world.oimoWorld = new OIMO.World();
    }
  }
}