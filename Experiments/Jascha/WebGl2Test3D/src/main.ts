namespace WebEngine {
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);


    // Shader sourcestrings are located at script's bottom end due to spacemanagement.

    let fudge0: FudgeNode;
    let fudge1: FudgeNode;
    let fudge2: FudgeNode;
    let fudge3: FudgeNode;
    let cameraNode: FudgeNode;
    let viewPort: Viewport;
    let shader:Shader;
    export let baseMaterial : BaseMaterial;

    export function init() {   
        console.log("Starting init().")
        GLUtil.initializeContext();

        shader = new Shader(vertexShaderSource, fragmentShaderSource);
        baseMaterial = new BaseMaterial(shader);
        // Setup for two testnodes and a CameraNode.
        
        let material: Material = new Material(baseMaterial, new Vec3(130, 130, 0));
        material.addTexture("https://cdn.shopify.com/s/files/1/1869/0319/products/ART-i-cant-adult-today_color-powder-blue_1024x1024.jpg?v=1523750709");
        let mesh: Mesh = new Mesh(new BoxGeometry(50, 50, 50).Positions);

        let transform0: Transform = new Transform();
        let pivot0: Pivot = new Pivot();
        fudge0 = new FudgeNode("Fudge0");
        fudge0.addComponent(mesh);
        fudge0.addComponent(material);
        fudge0.addComponent(pivot0);
        fudge0.addComponent(transform0);
        transform0.translate(0,-200,-200);
        pivot0.translateZ(0);

        fudge1 = new FudgeNode("Fudge1");
        let transform1: Transform = new Transform();
        let mesh1: Mesh = new Mesh(new BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(mesh1);
        fudge1.addComponent(transform1);
        transform1.translate(150, 0, 0);

        fudge2 = new FudgeNode("Fudge2");
        let transform2: Transform = new Transform();
        let mesh2: Mesh = new Mesh(new BoxGeometry(25, 25, 25).Positions);
        fudge2.addComponent(material);
        fudge2.addComponent(transform2);
        transform2.translate(0, -150, 0);

        fudge3 = new FudgeNode("Fudge3");
        let transform3: Transform = new Transform();
        let mesh3: Mesh = new Mesh(new BoxGeometry(15, 15, 100).Positions);
        fudge3.addComponent(mesh3);
        fudge3.addComponent(material);
        fudge3.addComponent(transform3);
        transform3.translate(0, 0, 0);


        cameraNode = new FudgeNode("Camera");
        let camtrans: Transform = new Transform();


        camtrans.lookAt((fudge0.getComponentByName("Transform")as Transform).Position);
        cameraNode.addComponent(camtrans);
        let camera: Camera = new Camera();
        cameraNode.addComponent(camera);


        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);


        viewPort = new Viewport(fudge0, camera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }


    // Trial function that animates the scene.
    function play(): void {
        let rotation: number = 1;
        //(fudge1.getComponentByName("Transform") as Transform).rotateY(rotation);
        (fudge2.getComponentByName("Transform") as Transform).rotateY(rotation);
        //(fudge0.getComponentByName("Transform") as Transform).rotateY(rotation);
        //(fudge1.getComponentByName("Transform") as Transform).translateX(rotation);

       // (fudge1.getComponentByName("Transform") as Transform).lookAt(fudge2);
        //(fudge3.getComponentByName("Transform") as Transform).lookAt(fudge1);
        viewPort.drawScene();
        requestAnimationFrame(play);
    }

    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event:KeyboardEvent):void{
        let transform : Transform =<Transform>cameraNode.getComponentByName("Transform");
        let target : Vec3 = (<Transform>fudge0.getComponentByName("Transform")).Position
        switch(_event.key){
            case "q":{
                transform.translateY(10);
                transform.lookAt(target);
                break;
            }
            case "e":{
                transform.translateY(-10);
                transform.lookAt(target);
                break;
            }
            case "a":{
                transform.translateX(-10);
                transform.lookAt(target);
                break;
            }
            case "d":{
                transform.translateX(10);
                transform.lookAt(target);
                break;
            }
            case "w":{
                transform.translateZ(-10);
                break;
            }
            case "s":{
                transform.translateZ(10);
                break;
            }
            case "r":{
                transform.reset();
                transform.lookAt(target);
                break;
            }
        }
    }



    // Trial function to setup the cube's face's colors (TODO: Outsource to Material?).


    // Shadersourcestrings below.


    var vertexShaderSource = `#version 300 es
 
    // an attribute is an input (in) to a vertex shader.
    // It will receive data from a buffer
    in vec4 a_position;
    in vec4 a_color;
    in vec2 a_textureCoordinate;

    // The Matrix to transform the positions by.
    uniform mat4 u_matrix;


    // Varying color in the fragmentshader.
    out vec4 v_color;
    // Varying texture in the fragmentshader.
    out vec2 v_textureCoordinate;


    // all shaders have a main function.
    void main() {  
        // Multiply all positions by the matrix.   
        vec4 position = u_matrix * a_position;


        gl_Position = u_matrix * a_position;

        // Pass color to fragmentshader.
        v_color = a_color;
        v_textureCoordinate = a_textureCoordinate;
    }
    `;
    var fragmentShaderSource = `#version 300 es
 
    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default. It means "medium precision"
    precision mediump float;
    
    // Color passed from vertexshader.
    in vec4 v_color;
    // Texture passed from vertexshader.
    in vec2 v_textureCoordinate;


    uniform sampler2D u_texture;
    // we need to declare an output for the fragment shader
    out vec4 outColor;
    
    void main() {
    outColor = v_color;
    outColor = texture(u_texture, v_textureCoordinate) * v_color;
    }`;
}