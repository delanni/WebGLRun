rd /S /Q public
md public
md public\play

echo bin >> ignore.txt
echo obj >> ignore.txt
echo tools>>ignore.txt
echo declarations >>ignore.txt
echo .csproj >> ignore.txt
echo .user >>ignore.txt
echo .sublime-workspace >> ignore.txt
echo .sublime-project >>ignore.txt
echo .config >> ignore.txt
echo .d.ts >> ignore.txt
echo .ts >> ignore.txt
echo .bat>> ignore.txt
xcopy src\CatcherInTheRay public\play\ /E /EXCLUDE:ignore.txt
del ignore.txt
attrib +R public /D /S
attrib +R public\play /D /S
copy public\play\play.html views\play.ejs /Y
copy public\play\index.html views\index.ejs /Y
copy public\play\error.html views\error.ejs /Y
copy public\play\css\* public\css\ /Y

pause