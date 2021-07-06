/**
 * Goes through all GLSL-Shaders in this folder and turns them into "TypeScript-Shaders".
 * A vertex-shader (.vert) and a fragment-shader(.frag) with the same file name are required
 * @authors Luis Keck, HFU, 2021
 */
var fs = require("fs");

var files = fs.readdirSync("./");
for (var i = 0; i < files.length; i++) {

    if (files[i].split(".")[1] == "vert")
        writeShader(files[i].split(".")[0]);
}

function writeShader(ShaderName) {

    fs.readFile(ShaderName + ".vert", function (err, data) {
        if (err) {
            return console.error(err);
        }
        var vert = data.toString();

        fs.readFile(ShaderName + ".frag", function (err, data) {
            if (err) {
                return console.error("Fragment shader (.frag) for " + ShaderName + " is missing.");
            }
            var frag = data.toString();

            var code = [
                "namespace NAMESPACE {",
                "import ƒ = FudgeCore;",
                "@ƒ.RenderInjectorShader.decorate",
                "export abstract class ",
                " extends ƒ.Shader {",
                "public static readonly iSubclass: number = ƒ.Shader.registerSubclass(",
                ");",
                "public static vertexShaderSource: string = `",
                "`;",
                "public static fragmentShaderSource: string = `",
                "`;",
                "}"
            ];

            fs.writeFile(ShaderName + ".ts", 
            code[0] + "\n\n" + code[1] + "\n\n" + code[2] + "\n" + code[3] + ShaderName + code[4] + "\n\n" + code[5] + ShaderName 
            + code[6] + "\n\n" + code[7] + vert + code[8] + "\n\n" + code[9] + frag + code[10] + "\n" + code[11] + "\n" + code[11], 
            function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        })
    })
}
 