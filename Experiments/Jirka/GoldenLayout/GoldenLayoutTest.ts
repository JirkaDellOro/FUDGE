namespace GoldenLayoutTest {
    let dim1: GoldenLayout.Dimensions = { borderWidth: 10 };
    let dim2: GoldenLayout.Dimensions = { borderWidth: 10 };

    let config: GoldenLayout.Config = { dimensions: dim1 };
    let golden: GoldenLayout = new GoldenLayout(config);

    console.log(dim1);
    console.log(dim2);
    console.log(golden);
}
