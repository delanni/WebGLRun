@echo off

rem # animal.bat
md %1
copy %1.js %1\%1.js
cd %1

rem #step 1 - split the three.js compressed file to separate three.js files
node ..\scripts\threeAnimationSplitter.js %1.js
rem # this outputs %1-threemeta.json

rem #step 2 - convert the three.js files to .obj files preserving everything
node ..\scripts\threeToObj.js %1-threemeta.json
rem # this outputs %1-objmeta.json

rem #step 3 - extract position, vertex and other info to js arrays
node ..\scripts\objFaceExtractor.js %1-objmeta.json
rem # this outputs %1-meshmeta.json

rem #step 4 - combine the meshdata to one .babylon file
node ..\scripts\meshMetaToBabylon.js %1-meshmeta.json
rem # this outputs the final file: %1.babylon

copy %1.babylon ..\%1.babylon
cd..
rmdir %1 /S /Q

echo %1 completed!

