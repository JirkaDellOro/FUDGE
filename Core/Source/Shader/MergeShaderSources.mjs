/**
 * Over the GLSL-Shaders in the source folder and writes a TS-File defining an array of shader strings.
 * @authors Jirka Dell'Oro-Friedl, HFU, 2022
 */
import * as fs from "fs";
import { argv } from "process";

let files /*: string[] */ = fs.readdirSync("GLSL");
// console.log(files);

// write collected shader sources to file SourceStrings.ts
let shaderStrings = `namespace FudgeCore {\n  export let shaderSources: {[source: string]: string} = {};\n`;
for (let name of files) {
  let shaderString = fs.readFileSync("GLSL/" + name, { encoding: 'utf8' })
  shaderStrings += `  shaderSources["${name}"] = /*glsl*/ \`${shaderString}\`;\n`
}
shaderStrings += `\n}`
fs.writeFileSync("MergedShaderSources.ts", shaderStrings);
