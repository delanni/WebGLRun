/// <reference path="references.ts" />

class korte {
	name: string;
	
	constructor(s:string){
		this.name = s;
	}
	
	say() {
		console.log(this.name);
	}
}