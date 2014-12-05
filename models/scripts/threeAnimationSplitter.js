var file = process.argv[2];
var fs= require("fs");
var beautify = require('js-beautify').js_beautify;

var modelName = file.split(".js")[0];
var threeFileContent;
if (threeFileContent = fs.readFileSync(file).toString()){
	var animal = JSON.parse(threeFileContent);
	var morphTargets = animal.morphTargets;
	var fileNames = [];
	delete animal.morphTargets;

	var fn = modelName+"-0.js";
	fileNames.push(fn);
	fs.writeFileSync(fn, beautify(JSON.stringify(animal)));
	console.log("File successfully written " + fn);

	for(var i=0;i<morphTargets.length;i++){
		var target = morphTargets[i];
		fn = modelName+"-"+ target.name + ".js";
		animal.vertices = target.vertices;
		
		fileNames.push(fn);
		fs.writeFileSync(fn, beautify(JSON.stringify(animal)));
		console.log("File successfully written " + fn);
	}
	fs.writeFileSync(modelName+"-threemeta.json", JSON.stringify(fileNames));
	console.log("File successfully written " + modelName+"-threemeta.json");
}
