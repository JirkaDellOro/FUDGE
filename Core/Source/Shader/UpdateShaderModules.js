var fs = require("fs");
fs.readFile("ShaderSources/ShaderModules.glsl", function (err, data) {
    if (err) {
        return console.error(err);
    }
    var modules = ["namespace FudgeCore {\nexport enum SHADER_MODULE {\n\n"];
    var src = data.toString().split("//");
    for (var i = 0; i < src.length - 1; i += 2) {
        var noBreak = src[i+1].split("\n");
        var withBreaks = "";
        for(var a = 1; a < noBreak.length; a++) {
            if (a != noBreak.length - 1)
                withBreaks += noBreak[a] + "\n";
            else
                withBreaks += noBreak[a];
        }

        if (i < src.length - 2)
            modules.push(src[i] + " = `" + withBreaks + "`,");
        else
            modules.push(src[i] + " = `" + withBreaks + "`");
    }

    modules.push("\n}\n}");
    var out = "";
    for (var j = 0; j < modules.length; j++)
        out += modules[j];
    
    fs.writeFile("ShaderSources/ShaderModules.ts", out, function (err) {
        if (err) {
            return console.error(err);
        }
    });
});