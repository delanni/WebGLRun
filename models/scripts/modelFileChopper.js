var fs = require("fs");
var beautify = require('js-beautify').js_beautify;

var inFile = process.argv[2];
var batFile = [];
if (!inFile){
	var inFiles = fs.readdirSync(".").filter(function(e){return e.indexOf(".js")+1});
} else {
	var inFiles = [inFile];
}
for(var i = 0;i < inFiles.length; i++) {
	var inFile = inFiles[i];

	if (inFile.indexOf("FileChopper")!=-1) continue; 

	var outFile = process.argv[3] || inFile;

	var fileText = fs.readFileSync(inFile).toString();

	var start = fileText.indexOf("{");
	var end = fileText.lastIndexOf("}");

	fileText = fileText.substring(start,end+1);

	fs.writeFileSync(outFile, fileText);
	console.log("File successfully chopped to: " + outFile);
	batFile.push("call animal.bat " + outFile.replace(".js",""));
}

fs.writeFileSync("convertAllAnimals.bat", batFile.join("\n"));