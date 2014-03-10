// CREDITS to Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/generators/perlinnoise.js
// Mutation by Alex

var PN_GENERATOR =
{
  RandomNoise: function(inParameters, inCanvas) 
  {   
    var g = inCanvas.getContext("2d"),
      imageData = g.getImageData( 0, 0, inCanvas.width, inCanvas.height ),
      pixels = imageData.data;

    for(var i = 0; i < pixels.length; i += 4 )
    {
/*      pixels[i] = ( inParameters.random.Random() * 256 ) | 0;
      pixels[i+1] = ( inParameters.random.Random() * 256 ) | 0;
      pixels[i+2] = ( inParameters.random.Random() * 256 ) | 0;*/

      pixels[i] = pixels[i+1] =pixels[i+2] =  (inParameters.random.Random() * 256 ) | 0;

      /*pixels[i] = pixels[i+1] = pixels[i+2] = ( inParameters.random.Random() * 256 ) | 0;*/
      pixels[i+3] = 255;
    }

    g.putImageData( imageData, 0, 0 );
    return inCanvas;
  },

  PerlinNoise: function(inParameters , canvas)
  {
    /**
     * This part is based on the snippest :
     * https://gist.github.com/donpark/1796361
     */

    var noise = this.RandomNoise( inParameters, canvas);
    var context = inParameters.canvas.getContext("2d");
    context.save();

    var ratio = inParameters.width / inParameters.height;
    
    /* Scale random iterations onto the canvas to generate Perlin noise. */
    for( var size = 4; size <= noise.height; size *= inParameters.param ) 
    {
      var x = ( inParameters.random.Random() * ( noise.width - size ) ) | 0,
        y = ( inParameters.random.Random() * ( noise.height - size ) ) | 0;
      context.globalAlpha = 4 / size;
      context.drawImage(noise, Math.max( x, 0 ), y, size * ratio, size, 0, 0, inParameters.width, inParameters.height);
    }
 
    context.restore();

    return canvas;
  },

  Generate: function(inParameters)
  {
    inParameters.param = Math.max( 1.1, inParameters.param||null );
    var canvas = this.CreateCanvas( inParameters.width, inParameters.height ) ;
    // Create the Perlin Noise
    var noise = this.PerlinNoise(inParameters,canvas);

    return noise;
  },

  CreateCanvas: function( inWidth, inHeight ) 
  {
    var canvas = document.createElement( "canvas" );
    canvas.width = inWidth;
    canvas.height = inHeight;
    if (window.debug == true){
      document.body.appendChild(canvas);
    }
    return canvas;
  }
};