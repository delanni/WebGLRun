var TERRAINGEN =
{
	CreateCanvas: function( inWidth, inHeight, appendCanvas) 
	{
		var canvas = document.createElement( "canvas" );
		canvas.width = inWidth;
		canvas.height = inHeight;
		if (window.debug == true || appendCanvas==true){
      		document.body.appendChild(canvas);
    	}
		return canvas;
	},
	
	Generate: function ( inParameters )
	{
		inParameters = inParameters || {};

		// Manage default parameters
		inParameters.type = inParameters.type || 0;
		inParameters.depth = inParameters.depth || 10;
		inParameters.width = inParameters.width || 100;
		inParameters.height = inParameters.height || 100;
		inParameters.postgen = inParameters.postgen || [];
		inParameters.effect = inParameters.effect || [];
		inParameters.filter = inParameters.filter || [];
		
		if( typeof inParameters.canvas == 'undefined' )
			inParameters.canvas = this.CreateCanvas( inParameters.width, inParameters.height );
		inParameters.width = canvas.width;
		inParameters.height = canvas.height;
		
		var noise = inParameters.generator.Generate(inParameters);
		
		// Apply filters
		for( var i = 0; i < inParameters.filter.length; ++i )
		{
			//inParameters.filter[i].Apply( noise, inParameters );
		}

	}	
};