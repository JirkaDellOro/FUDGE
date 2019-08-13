/**
 * Unfortunately, I can't really remember what the intention was to write this,
 * but the Shapes here are consequently a sequence of splines, resulting in a 
 * simple and consistent description off all kinds of shapes.
 */
namespace Shapes {
    window.addEventListener("load", init);
    let root: GameObject = new GameObject();
    let crc2: CanvasRenderingContext2D;
    
    function init(_event: Event): void {
        let canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];
        crc2 = canvas.getContext("2d");

        let go1: GameObject = new GameObject();
        let s: Shape = createSquare(100);
        go1.addComponent(s);
        go1.transform.x = 200;
        go1.transform.y = 150;
        go1.transform.r = Math.PI / 4;

        let go2: GameObject = new GameObject();
        s = createCircle(50);
        go2.addComponent(s);
        go2.transform.x = 60;
        go2.transform.y = 0;

        go1.addComponent(go2);
        go1.render(crc2);

        go1.addComponent(new TestScript());
        //console.log(go1.components);

        root.addComponent(go1);

        let components: Component[] = go1.getComponentsExtending(Component);
        console.log(components);
        animate();
    }

    function animate(): void {
        crc2.clearRect(0, 0, crc2.canvas.width, crc2.canvas.height);
        let s: GameObject = <GameObject>root.getComponents(GameObject)[0];
        s.transform.r += 0.01;
        s.transform.x += 1;
        if (s.transform.x > crc2.canvas.width)
            s.transform.x = 0;
        s.render(crc2);

        let t: TestScript = <TestScript>s.getComponents(TestScript)[0];
        t.sayHello();
        window.setTimeout(animate, 20);
    }

    function createSquare(_size: number): Shape {
        var s: Shape = new Shape();
        s.addPoint(-_size / 2, -_size / 2, 0, 0, 0, 0);
        s.addPoint(_size / 2, -_size / 2, 0, 0, 0, 0);
        s.addPoint(_size / 2, _size / 2, 0, 0, 0, 0);
        s.addPoint(-_size / 2, _size / 2, 0, 0, 0, 0);
        s.closed = true;
        return s;
    }

    function createCircle(_radius: number): Shape {
        let f: number = 0.55;
        var s: Shape = new Shape();
        s.addPoint(-_radius, 0, 0, 0, 0, -_radius * f);
        s.addPoint(0, -_radius, -_radius * f, 0, _radius * f, 0);
        s.addPoint(_radius, 0, 0, -_radius * f, 0, _radius * f);
        s.addPoint(0, _radius, _radius * f, 0, -_radius * f, 0);
        s.addPoint(-_radius, 0, 0, _radius * f, 0, -_radius * f);
        s.closed = true;
        return s;
    }
}