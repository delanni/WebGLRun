rd /S /Q public
md public
xcopy src\CatcherInTheRay public\ /E
attrib +R public\ /S
copy public\index.html views\index.ejs /Y