/**
 * Unfortunately, I can't really remember what the intention was to write this,
 * but the Shapes here are consequently a sequence of splines, resulting in a
 * simple and consistent description off all kinds of shapes.
 */
var Shapes;
(function (Shapes) {
    window.addEventListener("load", init);
    let root = new Shapes.GameObject("Root");
    let crc2;
    function init(_event) {
        let canvas = document.getElementsByTagName("canvas")[0];
        crc2 = canvas.getContext("2d");
        let go1 = new Shapes.GameObject("Square");
        let s = createSquare(100);
        go1.addComponent(s);
        go1.transform.x = 200;
        go1.transform.y = 150;
        go1.transform.r = Math.PI / 4;
        let go2 = new Shapes.GameObject("Circle");
        s = createCircle(50);
        go2.addComponent(s);
        go2.transform.x = 60;
        go2.transform.y = 0;
        go1.addComponent(go2);
        go1.render(crc2);
        go1.addComponent(new Shapes.TestScript());
        console.log(go1.components);
        root.addComponent(go1);
        animate();
    }
    function animate() {
        crc2.clearRect(0, 0, crc2.canvas.width, crc2.canvas.height);
        let s = root.find("Square");
        s.transform.r += 0.01;
        s.transform.x += 1;
        if (s.transform.x > crc2.canvas.width)
            s.transform.x = 0;
        s.render(crc2);
        let t = s.getScript(Shapes.TestScript);
        t.sayHello();
        window.setTimeout(animate, 20);
    }
    function createSquare(_size) {
        var s = new Shapes.Shape();
        s.addPoint(-_size / 2, -_size / 2, 0, 0, 0, 0);
        s.addPoint(_size / 2, -_size / 2, 0, 0, 0, 0);
        s.addPoint(_size / 2, _size / 2, 0, 0, 0, 0);
        s.addPoint(-_size / 2, _size / 2, 0, 0, 0, 0);
        s.closed = true;
        return s;
    }
    function createCircle(_radius) {
        let f = 0.55;
        var s = new Shapes.Shape();
        s.addPoint(-_radius, 0, 0, 0, 0, -_radius * f);
        s.addPoint(0, -_radius, -_radius * f, 0, _radius * f, 0);
        s.addPoint(_radius, 0, 0, -_radius * f, 0, _radius * f);
        s.addPoint(0, _radius, _radius * f, 0, -_radius * f, 0);
        s.addPoint(-_radius, 0, 0, _radius * f, 0, -_radius * f);
        s.closed = true;
        return s;
    }
})(Shapes || (Shapes = {}));
//# sourceMappingURL=Main.js.map