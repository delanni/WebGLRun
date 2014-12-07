var metaFile = process.argv[2];
var fs= require("fs");
var three = require("./three.js");
var objectifier = require("./OBJExporter.js");

var modelName = metaFile.split("-threemeta.json")[0];
if (!modelName) {
	console.log("Is the provided file really a three meta file?");
	process.exit();
}

var fileNames = JSON.parse(fs.readFileSync(metaFile).toString());
var objFiles = [];

if (fs.existsSync(modelName+"_colorMap.obj")){
	objFiles.push(modelName+"_colorMap.obj");
} else if (fs.existsSync("../"+modelName+"_colorMap.obj")){
	var f = fs.readFileSync("../"+modelName+"_colorMap.obj");
	fs.writeFileSync(modelName+"_colorMap.obj",f);
	objFiles.push(modelName+"_colorMap.obj");
}

for(var i=0;i< fileNames.length;i++){

	var threeFileName = fileNames[i];

	var threeFileContent;
	if (threeFileContent = fs.readFileSync(threeFileName).toString()){
		var parser = new three.JSONLoader();
		var exporter = new objectifier.OBJExporter();
		var animal = JSON.parse(threeFileContent);
		
		var threeObject = parser.parse(animal);
		var objString = exporter.parse(threeObject.geometry);

		fn = threeFileName.replace(".js",".obj");
		fs.writeFileSync(fn,objString);
		objFiles.push(fn);
		console.log("File successfully written " + fn);
	}
}

var objMetaFile = metaFile.replace("threemeta.json","objmeta.json");
fs.writeFileSync(objMetaFile, JSON.stringify(objFiles));
console.log("File successfully written "+ objMetaFile);
