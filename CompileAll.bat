::goto Test

:Core
echo --- Compile Shaders
cd Core/Source/Shader/
call node MergeShaderSources.mjs
cd ..
echo --- Compile Core
call tsc -p tsconfig.json
echo --- Compile Core Minimal
call tsc -p tsconfig-minimal.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..

:Aid
echo --- Compile Aid
cd Aid/Source/
call tsc -p tsconfig.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..

:UserInterface
echo --- Compile UserInterface
cd UserInterface/Source/
call tsc -p tsconfig.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..

:Net
echo --- Compile Net
cd Net
call tsc -p ./tsconfig.message.json
echo module.exports = {FudgeNet: FudgeNet}; >> .\\Source\\Server\\Message.js
call AddExport .\\Source\\Server\\Message.d.ts
call tsc -p ./tsconfig.server.json
call tsc -p ./tsconfig.client.json
cd ..

:Test
echo --- Compile Test
cd Test
call tsc -p tsconfig.json
cd ..
pause