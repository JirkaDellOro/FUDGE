namespace Iterator {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);
  let axis: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.INTEGRAL);

  function init(_event: Event): void {
    console.log(axis);

    document.addEventListener("keydown", hndKey);
    document.addEventListener("keyup", hndKey);
    document.addEventListener("mousemove", hndMouseMove);

    update();
  }

  function hndKey(_event: KeyboardEvent): void {
    if (_event.repeat)
      return;
    axis.setInput(_event.type == "keydown" ? 1 : 0);
  }
  function hndMouseMove(_event: MouseEvent): void {
    axis.setInput((_event.clientY - 100) * 0.1);
  }

  function update(): void {
    console.log(axis.getValue());
    window.setTimeout(update, 20);
  }
} 