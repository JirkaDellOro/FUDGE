/**
 * Testing automatically managed object reuse 
 * to avoid framerate drops due to carbage collection
 */
namespace ObjectManagerTest {
    class Test {
        message: string = "instance of Test";
        constructor() {
            //console.log(this.message);
            this.message += " created";
        }
    }

    //testFixedAmountAtStart(100000);
    testContinuousCreationAndDeletion(0);

    function testContinuousCreationAndDeletion(_nObjects: number): void {
        console.log("testContinuousCreationAndDeletion");
        let buffer: Object[][] = [];
        update();

        function update(): void {
            console.log("update");
            setTimeout(update, 1);
            let instances: Object[] = [];

            buffer.shift();
            for (let i: number; i < _nObjects; i++) {
                //instances.push(new Test());
                let test: Test = ObjectManager.create(Test);
                ObjectManager.reuse(test);
            }
            buffer.push(instances);
        }
    }

    function testFixedAmountAtStart(_nObjects: number): void {
        console.log("testFixedAmountAtStart");

        console.time("Create objects with new");
        createObjectsWithNew();
        console.timeEnd("Create objects with new");

        console.time("Create objects with create");
        createObjectsWithCreate();
        console.timeEnd("Create objects with create");

        function createObjectsWithCreate(): void {
            for (let i: number = 0; i < _nObjects; i++) {
                createOneObjectWithCreate();
            }
        }
        function createObjectsWithNew(): void {
            for (let i: number = 0; i < _nObjects; i++) {
                createOneObjectWithNew();
            }
        }
        function createOneObjectWithCreate(): void {
            let test: Test = ObjectManager.create(Test);
            //ObjectManager.reuse(test);
            test = null;
        }
        function createOneObjectWithNew(): void {
            let test: Test = new Test();
            test = null;
        }
    }
}
