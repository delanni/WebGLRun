rd /S /Q public
md public
xcopy src\Babylonian public\ /E
copy public\index.html views\index.ejs /Y
start chrome localhost:3000
node app.js