/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */

namespace FudgeAid {
  /** Format of methods to be used as transitions or actions */
  type StateMachineMethod<State> = (_machine: StateMachine<State>) => void;
  /** Type for maps associating a state to a method */
  type StateMachineMapStateToMethod<State> = Map<State, StateMachineMethod<State>>;
  /** Interface mapping a state to one action multiple transitions */
  interface StateMachineMapStateToMethods<State> {
    action: StateMachineMethod<State>;
    transitions: StateMachineMapStateToMethod<State>;
  }

  /**
   * Core functionality of the state machine, holding solely the current state and, while in transition, the next state,
   * the instructions for the machine and comfort methods to transit and act.
   */
  export class StateMachine<State> {
    public stateCurrent: State;
    public stateNext: State;
    public instructions: StateMachineInstructions<State>;

    public transit(_next: State): void {
      this.instructions.transit(this.stateCurrent, _next, this);
    }

    public act(): void {
      this.instructions.act(this.stateCurrent, this);
    }
  }

  /**
   * Set of instructions for a state machine. The set keeps all methods for dedicated actions defined for the states
   * and all dedicated methods defined for transitions to other states, as well as default methods.
   * Instructions exist independently from StateMachines. A statemachine instance is passed as parameter to the instruction set.
   * Multiple statemachine-instances can thus use the same instruction set and different instruction sets could operate on the same statemachine.
   */
  export class StateMachineInstructions<State> extends Map<State, StateMachineMapStateToMethods<State>> {
    /** Define dedicated transition method to transit from one state to another*/
    public setTransition(_current: State, _next: State, _transition: StateMachineMethod<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.getStateMethods(_current);
      active.transitions.set(_next, _transition);
    }

    /** Define dedicated action method for a state */
    public setAction(_current: State, _action: StateMachineMethod<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.getStateMethods(_current);
      active.action = _action;
    }

    /** Default transition method to invoke if no dedicated transition exists, should be overriden in subclass */
    public transitDefault(_machine: StateMachine<State>): void {
      //
    }
    
    /** Default action method to invoke if no dedicated action exists, should be overriden in subclass */
    public actDefault(_machine: StateMachine<State>): void {
      //
    }

    /** Invoke a dedicated transition method if found for the current and the next state, or the default method */
    public transit(_current: State, _next: State, _machine: StateMachine<State>): void {
      _machine.stateNext = _next;
      try {
        let active: StateMachineMapStateToMethods<State> = this.get(_current);
        let transition: StateMachineMethod<State> = active.transitions.get(_next);
        transition(_machine);
      } catch (_error) {
        // console.info(_error.message);
        this.transitDefault(_machine);
      } finally {
        _machine.stateCurrent = _next;
        _machine.stateNext = undefined;
      }
    }

    /** Invoke the dedicated action method if found for the current state, or the default method */
    public act(_current: State, _machine: StateMachine<State>): void {
      try {
        let active: StateMachineMapStateToMethods<State> = this.get(_current);
        active.action(_machine);
      } catch (_error) {
        // console.info(_error.message);
        this.actDefault(_machine);
      }
    }

    /** Find the instructions dedicated for the current state or create an empty set for it */
    private getStateMethods(_current: State): StateMachineMapStateToMethods<State> {
      let active: StateMachineMapStateToMethods<State> = this.get(_current);
      if (!active) {
        active = { action: null, transitions: new Map() };
        this.set(_current, active);
      }
      return active;
    }
  }
}