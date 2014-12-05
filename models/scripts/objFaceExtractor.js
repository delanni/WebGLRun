var metaFile = process.argv[2];
var fs= require("fs");
var beautify = require('js-beautify').js_beautify;

if (metaFile.indexOf("-objmeta.json")<0){
	console.log("Are you sure you gave an obj meta file?");
	process.exit();
}
var objFiles = JSON.parse(fs.readFileSync(metaFile).toString());
var jsonFiles = [];
for(var ix=0;ix<objFiles.length;ix++){
	var file = objFiles[ix];
	var objFileContent;
	if (objFileContent = fs.readFileSync(file).toString()){
		var rows = objFileContent.split("\n");
		var indices = [];
		var colors = [];
		var normals = [];
		var vertices = [];
		var uvs = [];

		var colorDictionary = {};
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			var words = row.split(" ");
			var type = words.shift();
			if (type=="f"){
				// BABYLON uses left winded coordinate system
				for(var j=2; j>=0;j--){
					var word = words[j].split("/");
					if (word[0]) {
						var vertexIndex = parseInt(word[0],10)-1;
						indices.push(vertexIndex);
						var hex = parseInt(word[1],10);
						var r = hex>>16;
						var g = (hex>>8)&0xff;
						var b = (hex)&0xff;
						colors[vertexIndex*3]=r/255;
						colors[vertexIndex*3+1]=g/255;
						colors[vertexIndex*3+2]=b/255;
					}
				}
			} else if (type=="v"){
				var x = parseFloat(words[0],10);
				var y = parseFloat(words[1],10);
				var z = parseFloat(words[2],10);
				vertices.push(x,y,z);
			} else if (type=="vt"){
				var x = parseFloat(words[0],10).toPrecision(8);
				var y = parseFloat(words[1],10).toPrecision(8);
				uvs.push(+x,+y);
			} else if (type=="vn"){
				var x = parseFloat(words[0],10).toPrecision(8);
				var y = parseFloat(words[1],10).toPrecision(8);
				var z = parseFloat(words[2],10).toPrecision(8);
				normals.push(+x,+y,+z);
			}
		}
		var obj = {vertices : vertices, indices: indices, colors:colors, normals:normals, uvs:uvs};
		var fn = file.split(".obj")[0]+"-obj.json";
		fs.writeFileSync(fn, beautify(JSON.stringify(obj)));
		jsonFiles.push(fn);
		console.log("File successfully written " + fn);
	}
}
console.log(colorDictionary);

var jsonMeta = metaFile.replace("objmeta.json", "meshmeta.json");
fs.writeFileSync(jsonMeta, JSON.stringify(jsonFiles));
console.log("File successfully written " + jsonMeta);