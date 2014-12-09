echo %1 %2
IF NOT DEFINED %1 break
IF NOT DEFINED %2 break
rd /S /Q %2public
md %2public

echo bin >> ignore.txt
echo obj >> ignore.txt
echo tools>>ignore.txt
echo declarations >> ignore.txt
echo .csproj >> ignore.txt
echo .user >>ignore.txt
echo .sublime-workspace >> ignore.txt
echo .sublime-project >>ignore.txt
echo .config >> ignore.txt
echo .d.ts >> ignore.txt
echo .ts >> ignore.txt
echo .bat>> ignore.txt
echo ignore.txt>>ignore.txt
xcopy %1. %2public\ /E /EXCLUDE:ignore.txt

del ignore.txt
rem attrib +R public /D /S
rem attrib +R public\play /D /S
rd /S /Q %2views
md %2views
copy %1play.html %2views\play.ejs /Y
copy %1index.html %2views\index.ejs /Y
copy %1error.html %2views\error.ejs /Y