// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex

var TerrainGenerator = (function () {
    function TerrainGenerator(canvas) {
        this.Canvas = canvas;
    }
    TerrainGenerator.prototype.Generate = function () {
        this.Parameters = this.Parameters || {};

        // Manage default parameters
        this.Parameters.type = this.Parameters.type || 0;
        this.Parameters.depth = this.Parameters.depth || 10;
        this.Parameters.width = this.Parameters.width || 100;
        this.Parameters.height = this.Parameters.height || 100;
        this.Parameters.postgen = this.Parameters.postgen || [];
        this.Parameters.effect = this.Parameters.effect || [];
        this.Parameters.filter = this.Parameters.filter || [];

        if (typeof this.Parameters.canvas == 'undefined')
            this.Parameters.canvas = CreateCanvas(this.Parameters.width, this.Parameters.height, this.Parameters.displayCanvas);
        this.Parameters.width = this.Canvas.width;
        this.Parameters.height = this.Canvas.height;

        var noise = this.Parameters.generator.Generate(this.Canvas);

        for (var i = 0; i < this.Parameters.filter.length; ++i) {
            //inParameters.filter[i].Apply( noise, inParameters );
        }
    };
    return TerrainGenerator;
})();
