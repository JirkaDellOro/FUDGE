"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
var ShaderParticleTest;
(function (ShaderParticleTest) {
    var ƒ = FudgeCore;
    let cubeRotation = 0.0;
    const numberOfParticles = 3;
    let parsed;
    window.fetch("test.json")
        .then(_response => _response.json())
        .then(_data => parsed = parseData(_data, []))
        .then(() => main());
    //
    // Start here
    //
    function main() {
        const canvas = document.querySelector("#glcanvas");
        const webgl = canvas.getContext("webgl2");
        // If we don"t have a GL context, give up now
        if (!webgl) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
        // Vertex shader program
        const vsSource = `#version 300 es
      in vec4 a_vctPosition;
      in vec4 a_vctColor;
  
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform float uNumberOfParticles;
      uniform float uTime;
      
      out vec4 v_vctColor;

      void main(void) {
        float particleIndex = float(gl_InstanceID);
        ${createStorageShaderCode(parsed)}
        ${createTransformationsShaderCode(parsed)}

        gl_Position = uProjectionMatrix * uModelViewMatrix${createPositionShaderCode(parsed)} * a_vctPosition;
        v_vctColor = a_vctColor + vec4(0.0, particleIndex * 0.5, 0.0, -particleTime);
      }
    `;
        // Fragment shader program
        const fsSource = `#version 300 es
      precision mediump float;
      
      in vec4 v_vctColor;
  
      out vec4 vctFrag;

      void main(void) {
        vctFrag = v_vctColor;
      }
    `;
        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = initShaderProgram(webgl, vsSource, fsSource);
        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for a_vctPosition, a_vctColor and also
        // look up uniform locations.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: webgl.getAttribLocation(shaderProgram, "a_vctPosition"),
                vertexColor: webgl.getAttribLocation(shaderProgram, "a_vctColor")
            },
            uniformLocations: {
                projectionMatrix: webgl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: webgl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                numberOfParticles: webgl.getUniformLocation(shaderProgram, "uNumberOfParticles"),
                time: webgl.getUniformLocation(shaderProgram, "uTime")
            }
        };
        // Here"s where we call the routine that builds all the
        // objects we"ll be drawing.
        const buffers = initBuffers(webgl);
        var then = 0;
        // Draw the scene repeatedly
        function render(_now) {
            const deltaTime = _now - then;
            then = _now;
            drawScene(webgl, programInfo, buffers, deltaTime, _now);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
    //
    // initBuffers
    //
    // Initialize the buffers we"ll need. For this demo, we just
    // have one object -- a simple two-dimensional square.
    //
    function initBuffers(_webgl) {
        // let particles: number[] = [...Array(numberOfParticles).keys()];
        // Create a buffer for the square"s positions.
        const positionBuffer = _webgl.createBuffer();
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        _webgl.bindBuffer(_webgl.ARRAY_BUFFER, positionBuffer);
        // Now create an array of positions for the square.
        const positions = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ];
        // for (let index = 0; index < numberOfParticles; index++) {
        //   positions.push(...);
        // }
        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        _webgl.bufferData(_webgl.ARRAY_BUFFER, new Float32Array(positions), _webgl.STATIC_DRAW);
        // Now set up the colors for the faces. We'll use solid colors
        // for each face.
        const faceColors = [
            [1.0, 1.0, 1.0, 1.0],
            [1.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [1.0, 1.0, 0.0, 1.0],
            [1.0, 0.0, 1.0, 1.0] // Left face: purple
        ];
        // Convert the array of colors into a table for all the vertices.
        let colors = [];
        for (var j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c);
        }
        const colorBuffer = _webgl.createBuffer();
        _webgl.bindBuffer(_webgl.ARRAY_BUFFER, colorBuffer);
        _webgl.bufferData(_webgl.ARRAY_BUFFER, new Float32Array(colors), _webgl.STATIC_DRAW);
        // Build the element array buffer; this specifies the indices
        // into the vertex arrays for each face's vertices.
        const indexBuffer = _webgl.createBuffer();
        _webgl.bindBuffer(_webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.
        const indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23 // left
        ];
        // Now send the element array to GL
        _webgl.bufferData(_webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _webgl.STATIC_DRAW);
        return {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer
        };
    }
    //
    // Draw the scene.
    //
    function drawScene(_webgl, _programInfo, _buffers, _deltaTime, _time) {
        _webgl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        _webgl.clearDepth(1.0); // Clear everything
        _webgl.enable(_webgl.DEPTH_TEST); // Enable depth testing
        _webgl.depthFunc(_webgl.LEQUAL); // Near things obscure far things
        _webgl.enable(_webgl.BLEND); // Enable depth testing
        _webgl.blendFunc(_webgl.SRC_ALPHA, _webgl.DST_ALPHA);
        // Clear the canvas before we start drawing on it.
        _webgl.clear(_webgl.COLOR_BUFFER_BIT | _webgl.DEPTH_BUFFER_BIT);
        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        const fieldOfView = 45; // in radians
        const aspect = _webgl.canvas.clientWidth / _webgl.canvas.clientHeight;
        const zNear = 1;
        const zFar = 1000;
        const projectionMatrix = ƒ.Matrix4x4.PROJECTION_CENTRAL(aspect, fieldOfView, zNear, zFar, ƒ.FIELD_OF_VIEW.DIAGONAL);
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = ƒ.Matrix4x4.IDENTITY();
        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        modelViewMatrix.translate(new ƒ.Vector3(0, 0, 20));
        modelViewMatrix.rotateZ(cubeRotation * 0.7);
        // modelViewMatrix.rotateX(cubeRotation);
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = _webgl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            _webgl.bindBuffer(_webgl.ARRAY_BUFFER, _buffers.position);
            _webgl.vertexAttribPointer(_programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            _webgl.enableVertexAttribArray(_programInfo.attribLocations.vertexPosition);
        }
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = _webgl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            _webgl.bindBuffer(_webgl.ARRAY_BUFFER, _buffers.color);
            _webgl.vertexAttribPointer(_programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            _webgl.enableVertexAttribArray(_programInfo.attribLocations.vertexColor);
        }
        // Tell WebGL which indices to use to index the vertices
        _webgl.bindBuffer(_webgl.ELEMENT_ARRAY_BUFFER, _buffers.indices);
        // Tell WebGL to use our program when drawing
        _webgl.useProgram(_programInfo.program);
        // Set the shader uniforms  
        _webgl.uniformMatrix4fv(_programInfo.uniformLocations.projectionMatrix, false, projectionMatrix.get());
        _webgl.uniformMatrix4fv(_programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix.get());
        _webgl.uniform1f(_programInfo.uniformLocations.numberOfParticles, numberOfParticles);
        _webgl.uniform1f(_programInfo.uniformLocations.time, _time);
        {
            const vertexCount = 36;
            const type = _webgl.UNSIGNED_SHORT;
            const offset = 0;
            _webgl.drawElementsInstanced(_webgl.TRIANGLES, vertexCount, type, offset, numberOfParticles);
        }
        // Update the rotation for the next draw
        cubeRotation += _deltaTime * 0.01;
    }
    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    function initShaderProgram(_webgl, _vsSource, _fsSource) {
        const vertexShader = loadShader(_webgl, _webgl.VERTEX_SHADER, _vsSource);
        const fragmentShader = loadShader(_webgl, _webgl.FRAGMENT_SHADER, _fsSource);
        // Create the shader program
        const shaderProgram = _webgl.createProgram();
        _webgl.attachShader(shaderProgram, vertexShader);
        _webgl.attachShader(shaderProgram, fragmentShader);
        _webgl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!_webgl.getProgramParameter(shaderProgram, _webgl.LINK_STATUS)) {
            alert("Unable to initialize the shader program: " + _webgl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }
    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    function loadShader(_webgl, _type, _source) {
        const shader = _webgl.createShader(_type);
        // Send the source to the shader object
        _webgl.shaderSource(shader, _source);
        // Compile the shader program
        _webgl.compileShader(shader);
        // See if it compiled successfully
        if (!_webgl.getShaderParameter(shader, _webgl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + _webgl.getShaderInfoLog(shader));
            _webgl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    function parseData(_data, _variableNames) {
        if (!_data || !_variableNames)
            return {};
        let effectStructure = {};
        for (const key in _data) {
            let subData = _data[key];
            if (ƒ.ParticleEffect.isClosureData(subData))
                effectStructure[key] = parseClosure(subData, _variableNames);
            else
                effectStructure[key] = parseData(subData, _variableNames);
        }
        return effectStructure;
    }
    let predefinedVariableMap = {
        index: "particleIndex",
        time: "uTime",
        size: "uNumberOfParticles"
    };
    function parseClosure(_data, _variableNames) {
        if (ƒ.ParticleEffect.isFunctionData(_data)) {
            let parameters = [];
            for (let param of _data.parameters) {
                parameters.push(parseClosure(param, _variableNames));
            }
            return createShaderCode(_data.function, parameters);
        }
        if (ƒ.ParticleEffect.isVariableData(_data)) {
            let predefined = predefinedVariableMap[_data.value];
            return predefined ? predefined : _data.value;
            // if (_variableNames.includes(_data.value)) {
            // return function (_variables: ƒ.ParticleVariables): number {
            //   // Debug.log("Variable", `"${_data}"`, _variables[<string>_data]);
            //   return <number>_variables[_data.value];
            // };
            // } else {
            // throw `"${_data.value}" is not a defined variable in the ${ƒ.ParticleEffect.name}`;
            // }
        }
        if (ƒ.ParticleEffect.isConstantData(_data)) {
            let value = _data.value.toString();
            return `${value}${value.includes(".") ? "" : ".0"}` + "f";
            // return function (_variables: ƒ.ParticleVariables): number {
            //   // Debug.log("Constant", _data);
            //   return <number>_data.value;
            // };
        }
        throw `invalid node structure`;
    }
    let closures = {
        "addition": (_parameters) => _parameters.reduce((_accumulator, _value) => `${_accumulator} + ${_value}`),
        "subtraction": (_parameters) => _parameters.reduce((_accumulator, _value) => `${_accumulator} - ${_value}`),
        "multiplication": (_parameters) => _parameters.reduce((_accumulator, _value) => `${_accumulator} * ${_value}`),
        "division": (_parameters) => _parameters.reduce((_accumulator, _value) => `${_accumulator} / ${_value}`),
        "modulo": (_parameters) => _parameters.reduce((_accumulator, _value) => `mod(${_accumulator}, ${_value})`)
        // "linear": ParticleClosureFactory.createLinear,
        // "polynomial": ParticleClosureFactory.createPolynomial3,
        // "squareRoot": ParticleClosureFactory.createSquareRoot,
        // "random": ParticleClosureFactory.createRandom
    };
    function createShaderCode(_function, _parameters) {
        if (_function in closures)
            return closures[_function](_parameters);
        else
            throw `"${_function}" is not an operation`;
    }
    function createStorageShaderCode(_structure) {
        let code = "";
        let storage = _structure["storage"];
        if (storage) {
            for (const partitionName in storage) {
                let partition = storage[partitionName];
                for (const variableName in partition) {
                    code += `float ${variableName} = ${partition[variableName]};\n`;
                }
            }
        }
        return code;
    }
    function createTransformationsShaderCode(_structure) {
        let code = "";
        let transformationsLocal = _structure["transformations"].local;
        if (transformationsLocal) {
            for (const key in transformationsLocal) {
                let transformation = transformationsLocal[key];
                switch (key) {
                    case "translate":
                        code += `mat4 translationMatrix = mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            ${transformation.x ? transformation.x : "0.0"}, ${transformation.y ? transformation.y : "0.0"}, ${transformation.z ? transformation.z : "0.0"}, 1.0);\n`;
                        break;
                    case "scale":
                        code += `mat4 scalingMatrix = mat4(
            ${transformation.x ? transformation.x : "1.0"}, 0.0, 0.0, 0.0,
            0.0, ${transformation.y ? transformation.y : "1.0"}, 0.0, 0.0,
            0.0, 0.0, ${transformation.z ? transformation.z : "1.0"}, 0.0,
            0.0, 0.0, 0.0, 1.0
            );\n`;
                        break;
                    case "rotate":
                        let sinX = `sin(${transformation.x ? transformation.x : "0.0"})`;
                        let cosX = `cos(${transformation.x ? transformation.x : "0.0"})`;
                        let sinY = `sin(${transformation.y ? transformation.y : "0.0"})`;
                        let cosY = `cos(${transformation.y ? transformation.y : "0.0"})`;
                        let sinZ = `sin(${transformation.z ? transformation.z : "0.0"})`;
                        let cosZ = `cos(${transformation.z ? transformation.z : "0.0"})`;
                        code += `mat4 rotationMatrix = mat4(
            ${cosZ} * ${cosY}, ${sinZ} * ${cosY}, -${sinY}, 0.0,
            ${cosZ} * ${sinY} * ${sinX} - ${sinZ} * ${cosX}, ${sinZ} * ${sinY} * ${sinX} + ${cosZ} * ${cosX}, ${cosY} * ${sinX}, 0.0,
            ${cosZ} * ${sinY} * ${cosX} + ${sinZ} * ${sinX}, ${sinZ} * ${sinY} * ${cosX} - ${cosZ} * ${sinX}, ${cosY} * ${cosX}, 0.0,
            0.0, 0.0, 0.0, 1.0
            );\n`;
                        break;
                }
            }
        }
        return code;
    }
    let positionCodeMap = {
        translate: "translationMatrix",
        scale: "scalingMatrix",
        rotate: "rotationMatrix"
    };
    function createPositionShaderCode(_structure) {
        let code = "";
        let transformationsLocal = _structure["transformations"].local;
        if (transformationsLocal) {
            for (const key in transformationsLocal) {
                code += ` * ${positionCodeMap[key]}`;
            }
        }
        return code;
    }
})(ShaderParticleTest || (ShaderParticleTest = {}));
//# sourceMappingURL=Main.js.map