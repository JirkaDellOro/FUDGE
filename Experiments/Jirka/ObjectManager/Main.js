/**
 * Testing automatically managed object reuse
 * to avoid framerate drops due to carbage collection
 */
var ObjectManagerTest;
(function (ObjectManagerTest) {
    class Test {
        constructor() {
            this.message = "instance of Test";
            //console.log(this.message);
            this.message += " created";
        }
    }
    //testFixedAmountAtStart(100000);
    testContinuousCreationAndDeletion(0);
    function testContinuousCreationAndDeletion(_nObjects) {
        console.log("testContinuousCreationAndDeletion");
        let buffer = [];
        update();
        function update() {
            console.log("update");
            setTimeout(update, 1);
            let instances = [];
            buffer.shift();
            for (let i; i < _nObjects; i++) {
                //instances.push(new Test());
                let test = ObjectManagerTest.ObjectManager.create(Test);
                ObjectManagerTest.ObjectManager.reuse(test);
            }
            buffer.push(instances);
        }
    }
    function testFixedAmountAtStart(_nObjects) {
        console.log("testFixedAmountAtStart");
        console.time("Create objects with new");
        createObjectsWithNew();
        console.timeEnd("Create objects with new");
        console.time("Create objects with create");
        createObjectsWithCreate();
        console.timeEnd("Create objects with create");
        function createObjectsWithCreate() {
            for (let i = 0; i < _nObjects; i++) {
                createOneObjectWithCreate();
            }
        }
        function createObjectsWithNew() {
            for (let i = 0; i < _nObjects; i++) {
                createOneObjectWithNew();
            }
        }
        function createOneObjectWithCreate() {
            let test = ObjectManagerTest.ObjectManager.create(Test);
            //ObjectManager.reuse(test);
            test = null;
        }
        function createOneObjectWithNew() {
            let test = new Test();
            test = null;
        }
    }
})(ObjectManagerTest || (ObjectManagerTest = {}));
//# sourceMappingURL=Main.js.map