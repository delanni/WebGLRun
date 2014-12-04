var metaFile = process.argv[2];
var fs= require("fs");

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
				for(var j=0; j<3;j++){
					var word = words.shift().split("/");
					if (word[0]) {
						indices.push(parseInt(word[0],10)-1);
					}
				}
			} else if (type=="v"){
				var x = parseFloat(words[0],10);
				var y = parseFloat(words[1],10);
				var z = parseFloat(words[2],10);
				vertices.push(x,y,z);

				var r = parseFloat(words[3],10);
				var g = parseFloat(words[4],10);
				var b = parseFloat(words[5],10);
				colors.push(r,g,b);

				var colorKey = [Math.floor(r*255),Math.floor(g*255),Math.floor(b*255)].join(",");
				colorDictionary[colorKey] = colorDictionary[colorKey] +1 || 1;
			} else if (type=="vt"){
				var x = parseFloat(words[0],10).toPrecision(8);
				var y = parseFloat(words[1],10).toPrecision(8);
				var z = parseFloat(words[2],10).toPrecision(8);
				uvs.push(+x,+y,+z);
			} else if (type=="vn"){
				var x = parseFloat(words[0],10).toPrecision(8);
				var y = parseFloat(words[1],10).toPrecision(8);
				var z = parseFloat(words[2],10).toPrecision(8);
				normals.push(+x,+y,+z);
			}
		}
		var obj = {vertices : vertices, indices: indices, colors:colors, normals:normals, uvs:uvs};
		var fn = file.split(".obj")[0]+"-obj.json";
		fs.writeFileSync(fn, JSON.stringify(obj));
		jsonFiles.push(fn);
		console.log("File successfully written " + fn);
	}
}
console.log(colorDictionary);

var jsonMeta = metaFile.replace("objmeta.json", "meshmeta.json");
fs.writeFileSync(jsonMeta, JSON.stringify(jsonFiles));
console.log("File successfully written " + jsonMeta);