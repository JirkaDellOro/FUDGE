/**
 * Updates the TypeScript files of all shaders to apply changes in the GLSL files 
 * (currently uses the files in folder 'ShaderSources/Vertex/' to determine the existing shaders)
 * @authors Luis Keck, HFU, 2021
 */
var fs = require("fs");

var files = fs.readdirSync("ShaderSources/Vertex/");//writeShader() is called once for every file in this folder
for (var i = 0; i < files.length; i++) {
    writeShader(files[i].split(".")[0]);
}

function writeShader(ShaderName) {
    
    //get the TypeScript code
    fs.readFile("ShaderCodeTemplate.txt", function (err, data) {
        if (err) {
            return console.error(err);
        }
        var code = data.toString().split("$");

        //get the vertex shader
        fs.readFile("ShaderSources/Vertex/" + ShaderName + ".vert", function (err, data) {
            if (err) {
                return console.error(err);
            }
            var vert = data.toString();

            //clean up vertex shader by removing unnecessary lines
            var vertClean = vert.split("#define GLSLIFY 1\n");
            vert = "";
            for (var i = 0; i < vertClean.length; i++)
                vert += vertClean[i];

            //get the fragment shader
            fs.readFile("ShaderSources/Fragment/" + ShaderName + ".frag", function (err, data) {
                if (err) {
                    return console.error(err);
                }
                var frag = data.toString();

                //clean up fragment shader by removing unnecessary lines
                var fragClean = frag.split("#define GLSLIFY 1");
                frag = "";
                for (var j = 0; j < fragClean.length; j++)
                    frag += fragClean[j];

                //combine TypeScript code, vertex shader and fragment shader and write in TypeScript file
                fs.writeFile("Shaders/" + ShaderName + ".ts", code[0] + ShaderName + code[1] + ShaderName + code[2] + vert + code[3] + frag + code[4], function (err) {
                    if (err) {
                        return console.error(err);
                    }
                });
            })
        })
    })
}