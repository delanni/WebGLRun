rd /S /Q public
md public
echo .d.ts >> ignore.txt
echo .bat >> ignore.txt
xcopy src\CatcherInTheRay public\ /E /EXCLUDE:ignore.txt
del ignore.txt
attrib +R public\ /S
copy public\index.html views\index.ejs /Y