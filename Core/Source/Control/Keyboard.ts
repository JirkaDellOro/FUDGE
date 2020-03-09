namespace FudgeCore {
  interface KeyPressed {
    [code: string]: boolean;
  }

  export abstract class Keyboard {
    private static keysPressed: KeyPressed = Keyboard.initialize();

    public static isPressedOne(_keys: KEYBOARD_CODE[]): boolean {
      for (let code of _keys) {
        if (Keyboard.keysPressed[code])
          return true;
      }
      return false;
    }

    public static isPressedCombo(_keys: KEYBOARD_CODE[]): boolean {
      for (let code of _keys) {
        if (!Keyboard.keysPressed[code])
          return false;
      }
      return true;
    }

    public static valueFor<T>(_active: T, _inactive: T, _keys: KEYBOARD_CODE[], _combo: boolean = false): T {
      if (!_combo && Keyboard.isPressedOne(_keys))
        return _active;
      if (Keyboard.isPressedCombo(_keys))
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