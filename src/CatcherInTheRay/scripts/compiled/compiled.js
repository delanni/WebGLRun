if (typeof BABYLON !== 'undefined') {
    // The original ground form height map is only able to process images from urls,
    // this extension makes it possibble to generate something to a canvas, then load it as a height map.
    // but Typescript (without hacks) does not allow for further extending classes from the outside, so I need my own hack
    if (typeof BABYLON.Mesh !== 'undefined') {
        Cast(BABYLON.Mesh).CreateGroundFromHeightMapOfCanvas = function (name, canvas, width, height, subdivisions, minHeight, maxHeight, scene, updatable) {
            //BABYLON.Mesh.CreateGroundFromHeightMap(name, url, width, height, subdiv, minhei, maxhei, scene,updatable?);
            var groundBase = BABYLON.Mesh.CreateGround(name, width, height, subdivisions, scene, updatable);

            var context = canvas.getContext("2d");
            var canvasBuffer = context.getImageData(0, 0, canvas.width, canvas.height);

            var vertexData = BABYLON.VertexData.CreateGroundFromHeightMap(width, height, subdivisions, minHeight, maxHeight, canvasBuffer.data, canvasBuffer.width, canvasBuffer.height);

            vertexData.applyToMesh(groundBase, updatable);

            return groundBase;
        };
    }

    // This was somehow not included in the babylon build I'm currently using, so I had to build it myself from a part of typescript file I found
    if (typeof BABYLON.VertexData !== 'undefined') {
        Cast(BABYLON.VertexData).CreateGroundFromHeightMap = function (width, height, subdivisions, minHeight, maxHeight, buffer, bufferWidth, bufferHeight) {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var row, col;

            for (row = 0; row <= subdivisions; row++) {
                for (col = 0; col <= subdivisions; col++) {
                    var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));

                    // Compute height
                    var heightMapX = (((position.x + width / 2) / width) * (bufferWidth - 1)) | 0;
                    var heightMapY = ((1.0 - (position.z + height / 2) / height) * (bufferHeight - 1)) | 0;

                    var pos = (heightMapX + heightMapY * bufferWidth) * 4;
                    var r = buffer[pos] / 255.0;
                    var g = buffer[pos + 1] / 255.0;
                    var b = buffer[pos + 2] / 255.0;

                    var gradient = r * 0.3 + g * 0.59 + b * 0.11;

                    position.y = minHeight + (maxHeight - minHeight) * gradient;

                    // Add  vertex
                    positions.push(position.x, position.y, position.z);
                    normals.push(0, 0, 0);
                    uvs.push(col / subdivisions, 1.0 - row / subdivisions);
                }
            }

            for (row = 0; row < subdivisions; row++) {
                for (col = 0; col < subdivisions; col++) {
                    indices.push(col + 1 + (row + 1) * (subdivisions + 1));
                    indices.push(col + 1 + row * (subdivisions + 1));
                    indices.push(col + row * (subdivisions + 1));

                    indices.push(col + (row + 1) * (subdivisions + 1));
                    indices.push(col + 1 + (row + 1) * (subdivisions + 1));
                    indices.push(col + row * (subdivisions + 1));
                }
            }

            // Normals
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        };
    }
}
var FILTERS;
(function (FILTERS) {
    var StackBlurFilter = (function () {
        function StackBlurFilter(radius, customRect) {
            if (customRect) {
                this._fullCanvas = false;
                this._customRect = customRect;
            } else {
                this._fullCanvas = true;
            }

            this._useAlpha = true;
            this._radius = radius;
        }
        StackBlurFilter.prototype.Check = function (canvas) {
            return true;
        };

        StackBlurFilter.prototype.Apply = function (canvas) {
            if (this._fullCanvas) {
                if (!this._useAlpha) {
                    BLUR.stackBlurCanvasRGBFromCanvas(canvas, 0, 0, canvas.width, canvas.height, this._radius);
                } else {
                    BLUR.stackBlurCanvasRGBAFromCanvas(canvas, 0, 0, canvas.width, canvas.height, this._radius);
                }
            } else {
                if (!this._useAlpha) {
                    BLUR.stackBlurCanvasRGBFromCanvas(canvas, this._customRect.x, this._customRect.y, this._customRect.width, this._customRect.height, this._radius);
                } else {
                    BLUR.stackBlurCanvasRGBAFromCanvas(canvas, this._customRect.x, this._customRect.y, this._customRect.width, this._customRect.height, this._radius);
                }
            }
            return canvas;
        };
        return StackBlurFilter;
    })();
    FILTERS.StackBlurFilter = StackBlurFilter;

    function Upscale(canvas, targetWidth, targetHeight) {
        var upscaled = CreateCanvas(targetWidth, targetHeight, false);
        var upscaledCtx = upscaled.getContext("2d");

        var originalContext = canvas.getContext("2d");
        var originalImgData = originalContext.getImageData(0, 0, canvas.width, canvas.height);

        upscaledCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetWidth, targetHeight);

        return upscaled;
    }
    FILTERS.Upscale = Upscale;
})(FILTERS || (FILTERS = {}));
var FILTERS;
(function (FILTERS) {
    /**
    * This filter overwrites the target canvas' area with the parameter's data.
    **/
    var CopyOverwriteFilter = (function () {
        function CopyOverwriteFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        CopyOverwriteFilter.prototype.Check = function (canvas) {
            return true;
        };

        CopyOverwriteFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramImgData = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height);

            var targetCtx = canvas.getContext("2d");

            //var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);
            targetCtx.putImageData(paramImgData, 0, 0);

            return canvas;
        };
        return CopyOverwriteFilter;
    })();
    FILTERS.CopyOverwriteFilter = CopyOverwriteFilter;

    /**
    * This filter copies the param data byte to byte and adds it to the target.
    **/
    var AdditiveCopyFilter = (function () {
        function AdditiveCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        AdditiveCopyFilter.prototype.Check = function (canvas) {
            return true;
        };

        AdditiveCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                targetImgData.data[ix] = Math.min((targetImgData.data[ix] + paramPixels[ix]), 255) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        };
        return AdditiveCopyFilter;
    })();
    FILTERS.AdditiveCopyFilter = AdditiveCopyFilter;

    /**
    * This filter copies the param data byte to byte and substracts it from the target (except for the alpha value);
    **/
    var SubstractiveCopyFilter = (function () {
        function SubstractiveCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        SubstractiveCopyFilter.prototype.Check = function (canvas) {
            return true;
        };

        SubstractiveCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                if (ix % 4 == 3)
                    continue;
                targetImgData.data[ix] = Math.max((targetImgData.data[ix] - paramPixels[ix]), 0) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        };
        return SubstractiveCopyFilter;
    })();
    FILTERS.SubstractiveCopyFilter = SubstractiveCopyFilter;

    var DarknessCopyFilter = (function () {
        function DarknessCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        DarknessCopyFilter.prototype.Check = function (canvas) {
            return true;
        };

        DarknessCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                if (ix % 4 == 3)
                    continue;
                targetImgData.data[ix] = Math.max((targetImgData.data[ix] - (255 - paramPixels[ix])), 0) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        };
        return DarknessCopyFilter;
    })();
    FILTERS.DarknessCopyFilter = DarknessCopyFilter;

    /**
    * This filter takes the canvas, and blurs it, while feeding itself back, so that the original image is copied back
    **/
    var BleedFeed = (function () {
        function BleedFeed(paramCanvas, blurRadius, iterations, darkfeed) {
            if (typeof darkfeed === "undefined") { darkfeed = false; }
            this._paramCanvas = paramCanvas;
            this._isDarkFeed = darkfeed;
            this._blurriness = blurRadius;
            this._iterations = iterations;
        }
        BleedFeed.prototype.Check = function (canvas) {
            return true;
        };

        BleedFeed.prototype.Apply = function (canvas) {
            var backup = document.createElement("canvas");
            backup.width = canvas.width;
            backup.height = canvas.height;

            // backup
            var copyFilter = new FILTERS.CopyOverwriteFilter(canvas);
            copyFilter.Apply(backup);

            var blurFilter = new FILTERS.StackBlurFilter(this._blurriness);
            var darkFeedback = new FILTERS.DarknessCopyFilter(backup);
            var lightFeedback = new FILTERS.AdditiveCopyFilter(backup);

            for (var i = 0; i < this._iterations; i++) {
                blurFilter.Apply(canvas);
                if (this._isDarkFeed) {
                    darkFeedback.Apply(canvas);
                } else {
                    lightFeedback.Apply(canvas);
                }
            }

            return canvas;
        };
        return BleedFeed;
    })();
    FILTERS.BleedFeed = BleedFeed;
})(FILTERS || (FILTERS = {}));
function CreateCanvas(inWidth, inHeight, debug) {
    if (typeof debug === "undefined") { debug = false; }
    var canvas = document.createElement("canvas");
    canvas.width = inWidth;
    canvas.height = inHeight;
    if (debug) {
        document.body.appendChild(canvas);
    }
    return canvas;
}

function Cast(item) {
    return item;
}

function GetDataOfCanvas(index) {
    var c = document.getElementsByTagName("canvas")[index];
    var ctx = c.getContext("2d");
    var imgData = ctx.getImageData(0, 0, c.width, c.height);
    return [c, ctx, imgData];
}
// CREDITS to Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/randoms/mersenne-twister.js
// CREDITS to Makoto Matsumoto and Takuji Nishimura and Sean McCullough http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html

var MersenneTwister = (function () {
    function MersenneTwister(seed) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }

        /* Period parameters */
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 0x9908b0df; /* constant vector a */
        this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
        this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

        this.mt = new Array(this.N); /* the array for the state vector */
        this.mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */

        this.init_genrand(seed);
    }
    MersenneTwister.prototype.Random = function () {
        return this.random();
    };

    MersenneTwister.prototype.init_genrand = function (s) {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            var sx = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] = (((((sx & 0xffff0000) >>> 16) * 1812433253) << 16) + (sx & 0x0000ffff) * 1812433253) + this.mti;

            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            this.mt[this.mti] >>>= 0;
            /* for >32 bit machines */
        }
    };

    MersenneTwister.prototype.init_by_array = function (init_key, key_length) {
        var i, j, k;
        this.init_genrand(19650218);
        i = 1;
        j = 0;
        k = (this.N > key_length ? this.N : key_length);
        for (; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + init_key[j] + j; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            j++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
            if (j >= key_length)
                j = 0;
        }
        for (k = this.N - 1; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
        }

        this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
    };

    MersenneTwister.prototype.genrand_int32 = function () {
        var y;
        var mag01 = new Array(0x0, this.MATRIX_A);

        /* mag01[x] = x * MATRIX_A  for x=0,1 */
        if (this.mti >= this.N) {
            var kk;

            if (this.mti == this.N + 1)
                this.init_genrand(5489); /* a default initial seed is used */

            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

            this.mti = 0;
        }

        y = this.mt[this.mti++];

        /* Tempering */
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);

        return y >>> 0;
    };

    MersenneTwister.prototype.genrand_int31 = function () {
        return (this.genrand_int32() >>> 1);
    };

    MersenneTwister.prototype.genrand_real1 = function () {
        return this.genrand_int32() * (1.0 / 4294967295.0);
        /* divided by 2^32-1 */
    };

    MersenneTwister.prototype.random = function () {
        return this.genrand_int32() * (1.0 / 4294967296.0);
        /* divided by 2^32 */
    };

    MersenneTwister.prototype.genrand_real3 = function () {
        return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
        /* divided by 2^32 */
    };

    MersenneTwister.prototype.genrand_res53 = function () {
        var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
    };
    return MersenneTwister;
})();
// CREDITS to Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/generators/perlinnoise.js
// Modified by Alex Szabo
/// <reference path="references.ts" />

var PerlinNoiseGenerator = (function () {
    function PerlinNoiseGenerator(inParameters) {
        /**
        * This part is based on the snippest :
        * https://gist.github.com/donpark/1796361
        */
        inParameters.param = inParameters.param || 1.1;
        inParameters.width = inParameters.width || 640;
        inParameters.height = inParameters.height || 480;

        if (!inParameters.canvas) {
            inParameters.canvas = CreateCanvas(inParameters.width, inParameters.height, inParameters.displayCanvas);
        }

        this.Canvas = inParameters.canvas;
        this.Parameters = inParameters;
        this.Random = inParameters.random;
    }
    PerlinNoiseGenerator.prototype.randomNoise = function (separateCanvas, displayCanvas) {
        var noiseCanvas = separateCanvas ? CreateCanvas(this.Parameters.width, this.Parameters.height, displayCanvas) : this.Canvas;

        var g = noiseCanvas.getContext("2d"), imageData = g.getImageData(0, 0, noiseCanvas.width, noiseCanvas.height), pixels = imageData.data;

        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i] = pixels[i + 1] = pixels[i + 2] = (this.Random.Random() * 256) | 0;

            pixels[i + 3] = 255;
        }

        g.putImageData(imageData, 0, 0);
        return noiseCanvas;
    };

    PerlinNoiseGenerator.prototype.Generate = function (canvas, separateCanvas) {
        if (typeof separateCanvas === "undefined") { separateCanvas = true; }
        // Create the Perlin Noise
        var noise = this.randomNoise(separateCanvas, this.Parameters.displayCanvas);
        var context = this.Canvas.getContext("2d");
        context.save();

        var ratio = this.Parameters.width / this.Parameters.height;

        for (var size = 4; size <= noise.height; size *= this.Parameters.param) {
            var x = (this.Random.Random() * (noise.width - size)) | 0, y = (this.Random.Random() * (noise.height - size)) | 0;
            context.globalAlpha = 4 / size;
            context.drawImage(noise, Math.max(x, 0), y, size * ratio, size, 0, 0, this.Parameters.width, this.Parameters.height);
        }

        context.restore();

        return canvas;
    };
    return PerlinNoiseGenerator;
})();
// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex

var TerrainGenerator = (function () {
    function TerrainGenerator(params) {
        this.Canvas = params.canvas;
        this.Parameters = params;
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
            if (this.Parameters.filter[i].Check(noise)) {
                this.Parameters.filter[i].Apply(noise);
            }
        }

        return noise;
    };

    TerrainGenerator.prototype.NoiseToBabylonMesh = function (noise, scene) {
        var terrainMesh = BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas(name, noise, this.Parameters.width, this.Parameters.height, this.Parameters.submesh, this.Parameters.minHeight, this.Parameters.maxHeight, scene, false);
        return terrainMesh;
    };
    return TerrainGenerator;
})();
var PathGenerator = (function () {
    function PathGenerator(seed) {
        this.r = new MersenneTwister(seed);
    }
    /**
    * This is the function to generate and draw a path on the canvas
    **/
    PathGenerator.prototype.MakePath = function (canvas, from, to, opaque) {
        if (typeof opaque === "undefined") { opaque = true; }
        var ctrlPoints = this.GeneratePath(canvas, from, to);
        var cmspline = this.makeCatmull(ctrlPoints);
        this.drawPath(canvas, cmspline, opaque);
    };

    /**
    * This is a generator who generates a path.
    **/
    PathGenerator.prototype.GeneratePath = function (canvas, from, to) {
        // preparing defaults
        from = from && [from] || [from, from];
        to = to && [to] || [to, to];
        from[0] = from[0] || 0;
        to[0] = to[0] || canvas.width;
        from[1] = from[1] || canvas.height;
        to[1] = to[1] || 0;

        // Steps for grading, higher the value, less the curves
        var STEP = 1;

        // Total steps to take
        var steps = (canvas.height / STEP) | 0;

        // The general direction of the path
        var dx = (to[0] - from[0]) / steps;
        var dy = (to[1] - from[1]) / steps;

        // The normalof the direction
        var normal = [-dy, dx];

        // Magnitude of the normal
        var m = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2));

        // Scaling it back to unit
        normal[0] /= m;
        normal[1] /= m;

        // The maximum offsetting from the path's line
        var offset = 100;

        var lastPinLength = 0;
        var lastPinIndex = -80000;
        var diagonalPoints = [];
        var ctrlPoints = [];
        ctrlPoints.push(from);
        ctrlPoints.push(from);

        for (var i = 0; i < steps; i++) {
            // Each step, we push another point by the diagonal's vector
            diagonalPoints.push([from[0] + dx * i, from[1] + dy * i, 0]);

            // sometimes...
            if (this.r.Random() > 0.90 && Math.abs(i - lastPinIndex) > 10 && Math.abs(i - canvas.height) > 10 && Math.abs(i) > 10) {
                // we put a pin
                lastPinIndex = i;

                // of length offset/2 tops, for one direction
                var l = Math.random() * offset - offset / 2;

                // and if this pin is too different from the last one
                if (Math.abs(l - lastPinLength) > offset * 0.5 && l * lastPinLength < 0) {
                    // we flip it
                    l *= -1;
                }
                lastPinLength = l;

                // Multiply our normal with the pin's length, so the pin will stand atop the diagonal
                var offsetX = normal[0] * l;
                var offsetY = normal[1] * l;

                // And the control point will be at the end of the pin
                var p = [from[0] + dx * i + offsetX, from[1] + dy * i + offsetY];
                ctrlPoints.push(p);
            }
        }
        ctrlPoints.push(diagonalPoints[diagonalPoints.length - 1]);
        ctrlPoints.push(diagonalPoints[diagonalPoints.length - 1]);

        return ctrlPoints;
    };

    PathGenerator.prototype.interpolate = function (P0, P1, P2, P3, u) {
        var u3 = u * u * u;
        var u2 = u * u;
        var f1 = -0.5 * u3 + u2 - 0.5 * u;
        var f2 = 1.5 * u3 - 2.5 * u2 + 1.0;
        var f3 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
        var f4 = 0.5 * u3 - 0.5 * u2;
        var x = P0[0] * f1 + P1[0] * f2 + P2[0] * f3 + P3[0] * f4;
        var y = P0[1] * f1 + P1[1] * f2 + P2[1] * f3 + P3[1] * f4;
        return [x, y];
    };

    PathGenerator.prototype.drawCatmull = function (canvas, points, xoffset) {
        var ctx = canvas.getContext("2d");
        xoffset = xoffset || 0;
        for (var i = 0; i < points.length - 3; i++) {
            ctx.beginPath();
            ctx.moveTo(points[i + 1][0], points[i + 1][1]);
            for (var j = 0; j < 50; j++) {
                var pi = this.interpolate(points[i], points[i + 1], points[i + 2], points[i + 3], j / 50);
                ctx.lineTo(pi[0] + xoffset, pi[1]);
            }
            ctx.stroke();
        }
    };

    PathGenerator.prototype.makeCatmull = function (anchors) {
        var _points = [];
        for (var i = 0; i < anchors.length - 3; i++) {
            var diff = Math.abs(anchors[i + 1][1] - anchors[i + 2][1]);
            for (var j = 0; j < diff; j++) {
                var pi = this.interpolate(anchors[i], anchors[i + 1], anchors[i + 2], anchors[i + 3], j / diff);
                _points.push([pi[0], pi[1], 0, 0, 0]);
            }
        }
        return _points;
    };

    PathGenerator.prototype.drawPath = function (canvas, points, clearBeforeDraw) {
        var ctx = canvas.getContext("2d");

        ctx.save();
        if (clearBeforeDraw) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.moveTo(points[0][0], points[0][1]);
        ctx.beginPath();

        for (var j = 0; j < points.length; j++)
            ctx.lineTo(points[j][0], points[j][1]);
        ctx.stroke();

        ctx.restore();
    };
    return PathGenerator;
})();
/// <reference path="HTMLTools.ts" />
/// <reference path="MersenneTwister.ts" />
/// <reference path="PerlinNoiseGenerator.ts" />
/// <reference path="TerrainGenerator.ts" />
/// <reference path="BabylonExtensions.ts" />
/// <reference path="PathGenerator.ts" />
/// <reference path="references.ts" />
var GAME;
(function (GAME) {
    var GameWorld = (function () {
        function GameWorld(canvasId, fullify) {
            var _this = this;
            this._canvas = Cast(document.getElementById(canvasId));
            this._engine = new BABYLON.Engine(this._canvas);
            this._scene = new BABYLON.Scene(this._engine);
            this._camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), this._scene);
            this._camera.attachControl(this._canvas);

            if (fullify) {
                this.extendCanvas(2 /* HARD */);
            }

            this.loadScene(2 /* GAME */);

            BABYLON.Tools.QueueNewFrame(function () {
                return _this.renderLoop();
            });
        }
        GameWorld.prototype.extendCanvas = function (fullify) {
            var _this = this;
            var parent = this._canvas.parentElement;
            if (fullify == 0 /* NO */)
                return;

            var resize = function () {
                if (fullify === 2 /* HARD */) {
                    _this._canvas.width = _this._canvas.parentElement.clientWidth;
                    _this._canvas.height = _this._canvas.parentElement.clientHeight;
                    _this._engine.resize();
                } else {
                    _this._canvas.style["width"] = "100%";
                    _this._canvas.style["height"] = "100%";
                }
            };

            window.onresize = resize;
            resize();
        };

        GameWorld.prototype.gameLoop = function () {
            this.triggerTicksOnAllEntities();
            this.collisionLoop();
        };

        GameWorld.prototype.renderLoop = function () {
            var _this = this;
            this._engine.beginFrame();
            this._scene.render();
            this._engine.endFrame();
            BABYLON.Tools.QueueNewFrame(function () {
                return _this.renderLoop();
            });
        };

        GameWorld.prototype.triggerTicksOnAllEntities = function () {
            //for (var i = 0; i < this.entities.length; i++) {
            //    if (this.entities[i].tick) {
            //        this.entities[i].tick();
            //    }
            //}
        };

        GameWorld.prototype.collisionLoop = function () {
            var behaviorsCollection = [];
            // First loop is testing all possibles collisions
            // and build a behaviors collisions collections to be called after this
            //for (var i = 0; i < this.entitiesRegisterCollision.length; i++) {
            //    for (var j = 0; j < this.entities.length; j++) {
            //        if ((this.entities[j]._hasCollisions) && (this.entities[j] != this.entitiesRegisterCollision[i])) {
            //            // Pure intersection on 3D Meshes
            //            if (this.entitiesRegisterCollision[i]._mesh.intersectsMesh(this.entities[j]._mesh, false)) {
            //                behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j] });
            //            }
            //            // Extends 3D collision with a custom behavior (used for particules emitted for instance)
            //            if (this.entitiesRegisterCollision[i]._descendantsCollision) {
            //                var descendants = this.entitiesRegisterCollision[i]._mesh.getDescendants();
            //                for (var k = 0; k < descendants.length; k++) {
            //                    if (descendants[k].intersectsMesh(this.entities[j]._mesh, false)) {
            //                        behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], descendants: descendants[k] });
            //                    }
            //                }
            //            }
            //            //Intersects Behaviors
            //            var intersectBehavior = this.entitiesRegisterCollision[i].intersectBehavior(this.entities[j]);
            //            if (intersectBehavior.value) {
            //                behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], tag: intersectBehavior.tag });
            //            }
            //        }
            //    }
            //}
            //// Asking to each entity to apply its collision behavior
            //for (var k = 0; k < behaviorsCollection.length; k++) {
            //    if ((behaviorsCollection[k].registeredEntity) != null)
            //        behaviorsCollection[k].registeredEntity.collisionBehavior(behaviorsCollection[k].targetEntity, behaviorsCollection[k]);
            //    if ((behaviorsCollection[k].targetEntity) != null)
            //        behaviorsCollection[k].targetEntity.collisionBehavior(behaviorsCollection[k].registeredEntity, behaviorsCollection[k]);
            //}
            //behaviorsCollection = [];
        };

        GameWorld.prototype.loadScene = function (s) {
            var _this = this;
            var animate;

            var animate;

            var buildTestScene = function () {
                var torusKnot;

                _this._scene = new BABYLON.Scene(_this._engine);

                _this._lights = [];
                _this._lights.push(new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 10, 0), _this._scene));

                _this._camera = new BABYLON.ArcRotateCamera("Camera", 10, 20, 30, new BABYLON.Vector3(0, 0, 0), _this._scene);
                _this._camera.attachControl(_this._canvas);

                torusKnot = BABYLON.Mesh.CreateTorusKnot("torusknot", 3, 2, 80, 30, 4, 4, _this._scene, true);
                animate = function () {
                    torusKnot.rotate(BABYLON.Vector3.Up(), 0.01, 0 /* LOCAL */);
                };
            };

            var buildGameScene = function () {
                var draftCanvas = CreateCanvas(800, 1200, true);
                var pathCanvas = CreateCanvas(800, 1200, true);
                var secondaryNoiseCanvas = CreateCanvas(400, 600, true);

                var bleedBlurPass1 = new FILTERS.BleedFeed(pathCanvas, 30, 6, true);
                var bleedBlurPass2 = new FILTERS.BleedFeed(pathCanvas, 8, 3, true);
                var smallBlurFilter = new FILTERS.StackBlurFilter(12);
                var darkenPathFilter = new FILTERS.DarknessCopyFilter(pathCanvas);

                _this._lights = [];
                _this._lights.push(new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 500, 0), _this._scene));

                animate = function () {
                };

                var mersenne = new MersenneTwister(1212);

                var noiseGen = new PerlinNoiseGenerator({
                    canvas: draftCanvas,
                    displayCanvas: true,
                    height: 1200,
                    width: 800,
                    random: mersenne,
                    param: 1.1
                });

                var pathGen = new PathGenerator(1515);
                pathGen.MakePath(pathCanvas, 80, pathCanvas.width - 80);
                bleedBlurPass1.Apply(pathCanvas);
                bleedBlurPass2.Apply(pathCanvas);

                //smallBlurFilter.Apply(pathCanvas);
                secondaryNoiseCanvas.getContext("2d").save();
                for (var i = 0; i < 5; i++) {
                    pathGen.MakePath(secondaryNoiseCanvas, (mersenne.Random() * secondaryNoiseCanvas.width) | 0, (mersenne.Random() * secondaryNoiseCanvas.width) | 0, i == 0);
                    secondaryNoiseCanvas.getContext("2d").translate(secondaryNoiseCanvas.width / 2, secondaryNoiseCanvas.height / 2);
                    secondaryNoiseCanvas.getContext("2d").rotate(Math.random() * 180);
                    secondaryNoiseCanvas.getContext("2d").translate(-secondaryNoiseCanvas.width / 2, -secondaryNoiseCanvas.height / 2);
                }
                secondaryNoiseCanvas.getContext("2d").restore();
                bleedBlurPass1.Apply(secondaryNoiseCanvas);
                smallBlurFilter.Apply(secondaryNoiseCanvas);

                var randomStridesFilter = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(secondaryNoiseCanvas, 800, 1200));

                var terrainGen = new TerrainGenerator({
                    canvas: draftCanvas,
                    generator: noiseGen,
                    height: 1200,
                    width: 800,
                    minHeight: 0,
                    maxHeight: 400,
                    submesh: 100,
                    displayCanvas: true,
                    filter: [randomStridesFilter, darkenPathFilter, smallBlurFilter]
                });

                var noise = terrainGen.Generate();

                var terrainMesh = terrainGen.NoiseToBabylonMesh(noise, _this._scene);

                var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", _this._scene);
                terrainMesh.material = groundMaterial;

                groundMaterial.ambientColor = BABYLON.Color3.FromInts(3, 35, 8);
                groundMaterial.diffuseColor = BABYLON.Color3.FromInts(0, 200, 39);
                groundMaterial.specularPower = 0;
                groundMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
            };

            switch (s) {
                case 0 /* TEST */:
                    buildTestScene();
                    break;
                case 2 /* GAME */:
                    buildGameScene();
                    break;
            }

            this._scene.beforeRender = function () {
                animate();
                _this.gameLoop();
            };
        };
        return GameWorld;
    })();
    GAME.GameWorld = GameWorld;

    (function (FullifyStates) {
        FullifyStates[FullifyStates["NO"] = 0] = "NO";
        FullifyStates[FullifyStates["SOFT"] = 1] = "SOFT";
        FullifyStates[FullifyStates["HARD"] = 2] = "HARD";
    })(GAME.FullifyStates || (GAME.FullifyStates = {}));
    var FullifyStates = GAME.FullifyStates;

    (function (Scenes) {
        Scenes[Scenes["TEST"] = 0] = "TEST";
        Scenes[Scenes["MAIN"] = 1] = "MAIN";
        Scenes[Scenes["GAME"] = 2] = "GAME";
    })(GAME.Scenes || (GAME.Scenes = {}));
    var Scenes = GAME.Scenes;
    ;
})(GAME || (GAME = {}));
var game = new GAME.GameWorld("mainCanvas", "hard");
