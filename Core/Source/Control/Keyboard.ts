namespace FudgeCore {
  interface KeyPressed {
    [code: string]: boolean;
  }

  /**
   * Collects the keys pressed on the keyboard and stores their status. 
   */
  export abstract class Keyboard {
    private static keysPressed: KeyPressed = Keyboard.initialize();
    // private static code_en: Object;

    /**
     * Returns true if one of the given keys is is currently being pressed.
     */
    public static isPressedOne(_keys: KEYBOARD_CODE[]): boolean {
      for (let code of _keys) {
        if (Keyboard.keysPressed[code])
          return true;
      }
      return false;
    }

    /**
     * Returns true if all of the given keys are currently being pressed
     */
    public static isPressedCombo(_keys: KEYBOARD_CODE[]): boolean {
      for (let code of _keys) {
        if (!Keyboard.keysPressed[code])
          return false;
      }
      return true;
    }

    /**
     * Returns the value given as _active if one or, when _combo is true, all of the given keys are pressed.
     * Returns the value given as _inactive if not.
     */
    public static mapToValue<T>(_active: T, _inactive: T, _keys: KEYBOARD_CODE[], _combo: boolean = false): T {
      if (!_combo && Keyboard.isPressedOne(_keys))
        return _active;
      if (Keyboard.isPressedCombo(_keys))
        return _active;
      return _inactive;
    }

    /**
     * Returns a balanced ternary value (either -1, 0 or 1) 
     * according to the match of the keys currently being pressed and the lists of keys given 
     */
    public static mapToTrit(_positive: KEYBOARD_CODE[], _negative: KEYBOARD_CODE[]): number {
      return Keyboard.mapToValue(-1, 0, _negative) + Keyboard.mapToValue(1, 0, _positive);
    }

    // public static locale(_keyboard: Object): void {
    //   if (!Keyboard.code_en) {
    //     // save original keyboard codes to be able to switch back later
    //     Keyboard.code_en = {};
    //     Object.assign(Keyboard.code_en, KEYBOARD_CODE);
    //   }

    //   for (let key in _keyboard) {
    //     let value: string = Reflect.get(_keyboard, key);
    //     for (let original in KEYBOARD_CODE)
    //       if (Reflect.get(KEYBOARD_CODE, original) == value)
    //         // remove original key the yields the value
    //         Reflect.deleteProperty(KEYBOARD_CODE, original);
    //     // add new key to yield that value
    //     Reflect.set(KEYBOARD_CODE, key, value);
    //   }
    // }

    private static initialize(): KeyPressed {
      let store: KeyPressed = {};
      document.addEventListener("keydown", Keyboard.hndKeyInteraction);
      document.addEventListener("keyup", Keyboard.hndKeyInteraction);
      return store;
    }

    private static hndKeyInteraction(_event: KeyboardEvent): void {
      Keyboard.keysPressed[_event.code] = (_event.type == "keydown");
    }
  }
}