namespace FudgeCore {
  /**
      * A physical connection between two bodies, designed to simulate behaviour within a real body. It has two axis, a swing and twist axis, similar to a Ragdoll joint,
      * but more restrictive in it's angles. Two RigidBodies need to be defined to use it. For actual rotating a upper/lower limit need to be set otherwise it's just a holding connection.
      * @authors Marko Fehrenbach, HFU, 2020
      */
  export class ComponentJointRagdoll extends ComponentJoint {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointRagdoll);

    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two [[Node]]s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    get firstAxis(): Vector3 {
      return new Vector3(this.jointFirstAxis.x, this.jointFirstAxis.y, this.jointFirstAxis.z);
    }
    set firstAxis(_value: Vector3) {
      this.jointFirstAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }
    /**
    * The axis connecting the the two [[Node]]s e.g. Vector3(0,1,0) to have a upward connection.
    *  When changed after initialization the joint needs to be reconnected.
    */
    get secondAxis(): Vector3 {
      return new Vector3(this.jointSecondAxis.x, this.jointSecondAxis.y, this.jointSecondAxis.z);
    }
    set secondAxis(_value: Vector3) {
      this.jointSecondAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The exact position where the two [[Node]]s are connected. When changed after initialization the joint needs to be reconnected.
     */
    get anchor(): Vector3 {
      return new Vector3(this.jointAnchor.x, this.jointAnchor.y, this.jointAnchor.z);
    }
    set anchor(_value: Vector3) {
      this.jointAnchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the first axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleFirstAxis(): number {
      return this.jointMaxAngle1 * 180 / Math.PI;
    }
    set maxAngleFirstAxis(_value: number) {
      this.jointMaxAngle1 = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the second axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleSecondAxis(): number {
      return this.jointMaxAngle2 * 180 / Math.PI;
    }
    set maxAngleSecondAxis(_value: number) {
      this.jointMaxAngle2 = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingTwist(): number {
      return this.jointTwistSpringDampingRatio;
    }
    set springDampingTwist(_value: number) {
      this.jointTwistSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistSpringDamper().dampingRatio = this.jointTwistSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencyTwist(): number {
      return this.jointTwistSpringFrequency;
    }
    set springFrequencyTwist(_value: number) {
      this.jointTwistSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistSpringDamper().frequency = this.jointTwistSpringFrequency;
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingSwing(): number {
      return this.jointSwingSpringDampingRatio;
    }
    set springDampingSwing(_value: number) {
      this.jointSwingSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSwingSpringDamper().dampingRatio = this.jointSwingSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencySwing(): number {
      return this.jointSwingSpringFrequency;
    }
    set springFrequencySwing(_value: number) {
      this.jointSwingSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSwingSpringDamper().frequency = this.jointSwingSpringFrequency;
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
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get twistMotorLimitUpper(): number {
      return this.jointTwistMotorLimitUpper * 180 / Math.PI;
    }
    set twistMotorLimitUpper(_value: number) {
      this.jointTwistMotorLimitUpper = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().upperLimit = this.jointTwistMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get twistMotorLimitLower(): number {
      return this.jointTwistMotorLimitLower * 180 / Math.PI;
    }
    set twistMotorLimitLower(_value: number) {
      this.jointTwistMotorLimitLower = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().lowerLimit = this.jointTwistMotorLimitLower;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get twistMotorSpeed(): number {
      return this.jointTwistMotorSpeed;
    }
    set twistMotorSpeed(_value: number) {
      this.jointTwistMotorSpeed = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().motorSpeed = this.jointTwistMotorSpeed;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get twistMotorTorque(): number {
      return this.twistMotorTorque;
    }
    set twistMotorTorque(_value: number) {
      this.twistMotorTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().motorTorque = this.twistMotorTorque;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */
    get internalCollision(): boolean {
      return this.jointInternalCollision;
    }
    set internalCollision(_value: boolean) {
      this.jointInternalCollision = _value;
      if (this.oimoJoint != null) this.oimoJoint.setAllowCollision(this.jointInternalCollision);
    }
    //#endregion

    private jointTwistSpringDampingRatio: number = 0;
    private jointTwistSpringFrequency: number = 0;

    private jointSwingSpringDampingRatio: number = 0;
    private jointSwingSpringFrequency: number = 0;

    private jointTwistMotorLimitUpper: number = 360;
    private jointTwistMotorLimitLower: number = 0;
    private jointTwistMotorTorque: number = 0;
    private jointTwistMotorSpeed: number = 0;

    private jointBreakForce: number = 0;
    private jointBreakTorque: number = 0;

    private config: OIMO.RagdollJointConfig = new OIMO.RagdollJointConfig();
    private jointTwistMotor: OIMO.RotationalLimitMotor;
    private jointTwistSpringDamper: OIMO.SpringDamper;
    private jointSwingSpringDamper: OIMO.SpringDamper;
    private jointAnchor: OIMO.Vec3;
    private jointFirstAxis: OIMO.Vec3;
    private jointSecondAxis: OIMO.Vec3;

    private jointInternalCollision: boolean;

    private jointMaxAngle1: number;
    private jointMaxAngle2: number;

    private oimoJoint: OIMO.RagdollJoint;


    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _firstAxis: Vector3 = new Vector3(1, 0, 0), _secondAxis: Vector3 = new Vector3(0, 0, 1), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointFirstAxis = new OIMO.Vec3(_firstAxis.x, _firstAxis.y, _firstAxis.z);
      this.jointSecondAxis = new OIMO.Vec3(_secondAxis.x, _secondAxis.y, _secondAxis.z);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      /*Tell the physics that there is a new joint? and on the physics start the actual joint is first created? Values can be set but the
        actual constraint ain't existent until the game starts?
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

    private constructJoint(): void {
      this.jointTwistSpringDamper = new OIMO.SpringDamper().setSpring(this.jointTwistSpringFrequency, this.jointTwistSpringDampingRatio);
      this.jointSwingSpringDamper = new OIMO.SpringDamper().setSpring(this.jointSwingSpringFrequency, this.jointSwingSpringDampingRatio);

      this.jointTwistMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointTwistMotorLimitLower, this.jointTwistMotorLimitUpper);
      this.jointTwistMotor.setMotor(this.jointTwistMotorSpeed, this.jointTwistMotorTorque);

      this.config = new OIMO.RagdollJointConfig();
      let attachedRBPos: Vector3 = this.attachedRigidbody.getContainer().mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointFirstAxis, this.jointSecondAxis);
      this.config.swingSpringDamper = this.jointSwingSpringDamper;
      this.config.twistSpringDamper = this.jointTwistSpringDamper;
      this.config.twistLimitMotor = this.jointTwistMotor;
      this.config.maxSwingAngle1 = this.jointMaxAngle1;
      this.config.maxSwingAngle2 = this.jointMaxAngle2;

      var j: OIMO.RagdollJoint = new OIMO.RagdollJoint(this.config);
      j.setBreakForce(this.breakForce);
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);

      this.oimoJoint = j;
    }

    private superAdd(): void {
      this.addConstraintToWorld(this);
    }

    private superRemove(): void {
      this.removeConstraintFromWorld(this);
    }

    private dirtyStatus(): void {
      Physics.world.changeJointStatus(this);
    }

  }
}