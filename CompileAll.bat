::goto Test

:Core
echo --- Compile Shaders
cd Core/Source/Shader/
call node MergeShaderSources.mjs
cd ..
echo --- Compile Core
call npx tsc -p tsconfig.json
echo --- Compile Core Minimal
call npx tsc -p tsconfig-minimal.json
echo --- Generate Documentation
call npx typedoc
cd ..
cd ..

:Aid
echo --- Compile Aid
cd Aid/Source/
call npx tsc -p tsconfig.json
echo --- Generate Documentation
call npx typedoc
cd ..
cd ..

:UserInterface
echo --- Compile UserInterface
cd UserInterface/Source/
call npx tsc -p tsconfig.json
echo --- Generate Documentation
call npx typedoc
cd ..
cd ..

:Net
echo --- Compile Net
cd Net
call npx tsc -p ./tsconfig.message.json
echo module.exports = {FudgeNet: FudgeNet}; >> .\\Source\\Server\\Message.js
call AddExport .\\Source\\Server\\Message.d.ts
call npx tsc -p ./tsconfig.server.json
call npx tsc -p ./tsconfig.client.json
cd ..

:Test
echo --- Compile Test
cd Test
call npx tsc -p tsconfig.json
cd ..
pause