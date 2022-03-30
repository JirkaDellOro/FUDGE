@rem Core
@rem CompileShaders
echo --- Compile Shaders
cd Core/Source/Shader/
call node CompileShaders.mjs CompileShaders.json
cd ..
echo --- Compile Core
call tsc -p tsconfig.json
echo --- Compile Core Minimal
call tsc -p tsconfig-minimal.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..
pause

@rem Aid
echo --- Compile Aid
cd Aid/Source/
call tsc -p tsconfig.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..
pause

@rem UserInterface
echo --- Compile UserInterface
cd UserInterface/Source/
call tsc -p tsconfig.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..
pause

@rem Net
echo --- Compile Net
call code Net --run-task foo
cd UserInterface/Source/
call tsc -p tsconfig.json
echo --- Generate Documentation
call typedoc
cd ..
cd ..
pause