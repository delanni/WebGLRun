
// experimental
var PATHGEN = {
	makePath: function(canvas, from, to, curvefactor){
		from = from || [from,from];
		to = to || [to,to];
		from[0]= from[0]||0;
		to[0]= to[0]||canvas.width;
		from[1]= from[1]||canvas.height;
		to[1]= to[1]||0;
		var STEP = 1;
		var CURVEFACTOR = curvefactor || 10;
		var steps = (canvas.height/STEP)|0;

		var dx =(to[0]-from[0])/steps;
		var dy =(to[1]-from[1])/steps;

		var normal = [-dy,dx];
		var m = Math.sqrt(Math.pow(normal[0],2)+Math.pow(normal[1],2));
		normal[0]/=m; normal[1]/=m;
		offset = 100;

		var lpast=0;
		var ipast = -80000;
		var points = [];
		var ctrlPoints = [];
		ctrlPoints.push(from);
		ctrlPoints.push(from);
		for(var i =0; i<steps; i++){
			points.push([from[0]+dx*i, from[1]+dy*i, 0]);
			if (Math.random()>0.90 && Math.abs(i-ipast)>10 && Math.abs(i-canvas.height)>10 && Math.abs(i)>10) {
				ipast=i;
				var l = Math.random()*offset - offset/2;
				if (Math.abs(l-lpast)>offset*0.5 && l*lpast<0) l*=-1;
				lpast = l;
				var offsetX =  normal[0]*l;
				var offsetY =  normal[1]*l;
				var p = [from[0]+dx*i +offsetX, from[1]+dy*i+offsetY];
				ctrlPoints.push(p);
			}

		}
		ctrlPoints.push(points[points.length-1]);
		ctrlPoints.push(points[points.length-1]);

		//drawCatmull(canvas,ctrlPoints);
		var cmspline = this.makeCatmull(ctrlPoints);
		this.drawPath(canvas,cmspline);
	},

	drawCatmull: function(points, xoffset){
		xoffset = xoffset || 0;
		for(var i = 0; i < points.length-3; i++){
			ctx.beginPath();
			ctx.moveTo(points[i+1][0],points[i+1][1]);
			for(var j=0; j< 50; j++){
				var pi = this.interpolate(points[i],points[i+1],points[i+2],points[i+3],j/50);
				ctx.lineTo(pi[0] + xoffset ,pi[1]);
			}
			ctx.stroke();
		}
	},

	interpolate: function(P0, P1, P2, P3, u)
	{
		var u3 = u * u * u;
		var u2 = u * u;
		var f1 = -0.5 * u3 + u2 - 0.5 * u;
		var f2 =  1.5 * u3 - 2.5 * u2 + 1.0;
		var f3 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
		var f4 =  0.5 * u3 - 0.5 * u2;
		var x = P0[0] * f1 + P1[0] * f2 + P2[0] * f3 + P3[0] * f4;
		var y = P0[1] * f1 + P1[1] * f2 + P2[1] * f3 + P3[1] * f4;
		return [x,y];
	},


	makeCatmull: function(points){
		var _points = [];
		for(var i = 0; i < points.length-3; i++){
			var diff = Math.abs(points[i+1][1] - points[i+2][1]);
			for(var j=0; j< diff; j++){
				var pi = this.interpolate(points[i],points[i+1],points[i+2],points[i+3],j/diff);
				_points.push([pi[0], pi[1], 0, 0, 0]);
			}
		}
		return _points;
	},


	drawPath: function(canvas, points){
		var ctx = canvas.getContext("2d");
		ctx.moveTo(points[0][0],points[0][1]);
		ctx.beginPath();

		for(var j=0;j<points.length;j++)
			ctx.lineTo(points[j][0],points[j][1]);
			
		ctx.stroke();

		for(var j=0;j<points.length;j++){
			ctx.beginPath();
			ctx.arc(points[j][0],points[j][1],80,0,2*Math.PI);
			// Create gradient
			var grd=ctx.createRadialGradient(points[j][0],points[j][1],0,points[j][0],points[j][1],40);
			grd.addColorStop(0,"rgba(0,0,0,0.1)");
			grd.addColorStop(1,"rgba(0,0,0,0)");
			ctx.fillStyle=grd;
			ctx.fill();
		}
	}


};