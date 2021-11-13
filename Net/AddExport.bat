@echo off

set filename=%1
if not defined filename (
  echo usage: AddExport.bat filename
  pause
  exit
)

copy %filename% ExportCopy.temp
setLocal EnableDelayedExpansion
echo // manipulated by AddExport.bat > %filename%

for /f "tokens=*" %%a in (ExportCopy.temp) do (
  if not defined inserted (
    echo export %%a >> %filename%
  ) else (
    echo %%a >> %filename%
  )
  set /A inserted=1
)
del ExportCopy.temp