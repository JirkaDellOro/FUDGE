namespace ArrayPerformance {
  let count: number = 0;
  // let standard: number[] = new Array();
  let standard: ArrayRecycable = new ArrayRecycable();

  window.requestAnimationFrame(updateStandard);

  function updateStandard(): void {
    // console.log(count);
    standard.reset();
    for (let i: number = 0; i < 10000; i++)
      standard.push(count + i);
    count++;
    window.requestAnimationFrame(updateStandard);
  }
}