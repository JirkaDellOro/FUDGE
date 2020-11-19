namespace FudgeCore {
  interface KeyPressed {
    [code: string]: boolean;
  }

  /**
   * Collects the keys pressed on the keyboard and stores their status. 
   */
  export abstract class Keyboard {
    private static keysPressed: KeyPressed = Keyboard.initialize();

    /**
     * Returns true if the given key is currently being pressed
     * @param _key The keycode of the key to be checked
     */
    public static isPressed(_key: KEYBOARD_CODE): boolean {
      return Keyboard.keysPressed[_key];
    }

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
     * Returns the value given as _actibe if _key is pressed.
     * Returns the value given as _inactive if not.
     * @param _active The value which is returned when _key is pressed
     * @param _inactive The value which is returned when _key is not pressed
     * @param _key The keycode to map the values to
     */
    public static mapToValueOne<T>(_active: T, _inactive: T, _key: KEYBOARD_CODE): T {
      if (Keyboard.isPressed(_key))
        return _active;
      return _inactive;
    }

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