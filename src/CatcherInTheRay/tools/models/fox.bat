@echo off

rem # fox.bat
md fox
copy fox.js fox\fox.js
cd fox

rem #step 1 - split the three.js compressed file to separate three.js files
node ..\scripts\threeAnimationSplitter.js fox.js
rem # this outputs fox-threemeta.json

rem #step 2 - convert the three.js files to .obj files preserving everything
node ..\scripts\threeToObj.js fox-threemeta.json
rem # this outputs fox-objmeta.json

rem #step 3 - extract position, vertex and other info to js arrays
node ..\scripts\objFaceExtractor.js fox-objmeta.json
rem # this outputs fox-meshmeta.json

rem #step 4 - combine the meshdata to one .babylon file
node ..\scripts\meshMetaToBabylon.js fox-meshmeta.json
rem # this outputs the final file: fox.babylon

copy fox.babylon ..\fox.babylon

echo completed!
pause
