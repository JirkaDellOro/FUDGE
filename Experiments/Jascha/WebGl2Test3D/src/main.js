var WebEngine;
(function (WebEngine) {
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);
    // Shader sourcestrings are located at script's bottom end due to spacemanagement.
    let fudge0;
    let fudge1;
    let fudge2;
    let fudge3;
    let cameraNode;
    let viewPort;
    let shader;
    function init() {
        console.log("Starting init().");
        WebEngine.GLUtil.initializeContext();
        shader = new WebEngine.Shader(vertexShaderSource, fragmentShaderSource);
        WebEngine.baseMaterial = new WebEngine.BaseMaterial(shader);
        // Setup for two testnodes and a CameraNode.
        let material = new WebEngine.Material(WebEngine.baseMaterial, new WebEngine.Vec3(130, 130, 0));
        material.addTexture("https://cdn.shopify.com/s/files/1/1869/0319/products/ART-i-cant-adult-today_color-powder-blue_1024x1024.jpg?v=1523750709");
        let mesh = new WebEngine.Mesh(new WebEngine.BoxGeometry(50, 50, 50).Positions);
        let transform0 = new WebEngine.Transform();
        let pivot0 = new WebEngine.Pivot();
        fudge0 = new WebEngine.FudgeNode("Fudge0");
        fudge0.addComponent(mesh);
        fudge0.addComponent(material);
        fudge0.addComponent(pivot0);
        fudge0.addComponent(transform0);
        transform0.translate(0, -200, -200);
        pivot0.translateZ(0);
        fudge1 = new WebEngine.FudgeNode("Fudge1");
        let transform1 = new WebEngine.Transform();
        let mesh1 = new WebEngine.Mesh(new WebEngine.BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(mesh1);
        fudge1.addComponent(transform1);
        transform1.translate(150, 0, 0);
        fudge2 = new WebEngine.FudgeNode("Fudge2");
        let transform2 = new WebEngine.Transform();
        let mesh2 = new WebEngine.Mesh(new WebEngine.BoxGeometry(25, 25, 25).Positions);
        fudge2.addComponent(material);
        fudge2.addComponent(transform2);
        transform2.translate(0, -150, 0);
        fudge3 = new WebEngine.FudgeNode("Fudge3");
        let transform3 = new WebEngine.Transform();
        let mesh3 = new WebEngine.Mesh(new WebEngine.BoxGeometry(15, 15, 100).Positions);
        fudge3.addComponent(mesh3);
        fudge3.addComponent(material);
        fudge3.addComponent(transform3);
        transform3.translate(0, 0, 0);
        cameraNode = new WebEngine.FudgeNode("Camera");
        let camtrans = new WebEngine.Transform();
        camtrans.lookAt(fudge0.getComponentByName("Transform").Position);
        cameraNode.addComponent(camtrans);
        let camera = new WebEngine.Camera();
        cameraNode.addComponent(camera);
        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);
        viewPort = new WebEngine.Viewport(fudge0, camera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }
    WebEngine.init = init;
    // Trial function that animates the scene.
    function play() {
        let rotation = 1;
        //(fudge1.getComponentByName("Transform") as Transform).rotateY(rotation);
        fudge2.getComponentByName("Transform").rotateY(rotation);
        //(fudge0.getComponentByName("Transform") as Transform).rotateY(rotation);
        //(fudge1.getComponentByName("Transform") as Transform).translateX(rotation);
        // (fudge1.getComponentByName("Transform") as Transform).lookAt(fudge2);
        //(fudge3.getComponentByName("Transform") as Transform).lookAt(fudge1);
        viewPort.drawScene();
        requestAnimationFrame(play);
    }
    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event) {
        let transform = cameraNode.getComponentByName("Transform");
        let target = fudge0.getComponentByName("Transform").Position;
        switch (_event.key) {
            case "q": {
                transform.translateY(10);
                transform.lookAt(target);
                break;
            }
            case "e": {
                transform.translateY(-10);
                transform.lookAt(target);
                break;
            }
            case "a": {
                transform.translateX(-10);
                transform.lookAt(target);
                break;
            }
            case "d": {
                transform.translateX(10);
                transform.lookAt(target);
                break;
            }
            case "w": {
                transform.translateZ(-10);
                break;
            }
            case "s": {
                transform.translateZ(10);
                break;
            }
            case "r": {
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
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=main.js.map