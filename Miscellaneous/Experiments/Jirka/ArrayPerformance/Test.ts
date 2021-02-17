namespace ArrayPerformance {
  let count: number = 0;
  // let array: number[] = new Array();
  let array: ArrayRecycable<number> = new ArrayRecycable<number>();

  window.requestAnimationFrame(updateStandard);

  function updateStandard(): void {
    // console.log(count);
    array.reset();
    for (let i: number = 0; i < 100; i++)
      array.push(count + i);
    count++;
    // window.requestAnimationFrame(updateStandard);
    array.reset();

    for (let i: number = 0; i < 10; i++)
      array.push(count + i);

    for (let entry of array)
      console.log(entry);

    // console.log(...array);
    // array.map(_entry => console.log(_entry));
  }
}