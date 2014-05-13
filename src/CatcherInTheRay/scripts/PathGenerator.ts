class PathGenerator {

    r: RandomProvider;

    constructor(seed: number) {
        this.r = new MersenneTwister(seed);
    }

    /**
    * This is the function to generate and draw a path on the canvas
    **/
    MakePath(canvas: HTMLCanvasElement, from, to, opaque:boolean=true) {
        var ctrlPoints = this.GeneratePath(canvas, from, to)
        var cmspline = this.makeCatmull(ctrlPoints);
        this.drawPath(canvas, cmspline, opaque);
    }

    /**
    * This is a generator who generates a path.
    **/
    GeneratePath(canvas: HTMLCanvasElement, from, to): any[] {
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
        normal[0] /= m; normal[1] /= m;

        // The maximum offsetting from the path's line
        var offset = 100;

        var lastPinLength = 0;
        var lastPinIndex = -80000;
        var diagonalPoints = [];
        var ctrlPoints = [];
        ctrlPoints.push(from);
        ctrlPoints.push(from);

        // TODO: change this from step based iteration to pixel based
        for (var i = 0; i < steps; i++) {
            // Each step, we push another point by the diagonal's vector
            diagonalPoints.push([from[0] + dx * i, from[1] + dy * i, 0]);

            // sometimes...
            if (this.r.Random() > 0.90
            // we had at least 10 steps since the last pin
                && Math.abs(i - lastPinIndex) > 10
            // we are at least 10 steps away from the edges
                && Math.abs(i - canvas.height) > 10
                && Math.abs(i) > 10) {
                // we put a pin
                lastPinIndex = i;
                // of length offset/2 tops, for one direction 
                var l = Math.random() * offset - offset / 2;
                // and if this pin is too different from the last one
                if (Math.abs(l - lastPinLength) > offset * 0.5
                    && l * lastPinLength < 0) {
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
    }

    private interpolate(P0, P1, P2, P3, u) {
        var u3 = u * u * u;
        var u2 = u * u;
        var f1 = -0.5 * u3 + u2 - 0.5 * u;
        var f2 = 1.5 * u3 - 2.5 * u2 + 1.0;
        var f3 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
        var f4 = 0.5 * u3 - 0.5 * u2;
        var x = P0[0] * f1 + P1[0] * f2 + P2[0] * f3 + P3[0] * f4;
        var y = P0[1] * f1 + P1[1] * f2 + P2[1] * f3 + P3[1] * f4;
        return [x, y];
    }

    drawCatmull(canvas: HTMLCanvasElement, points, xoffset: number) {
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
    }

    makeCatmull(anchors: Array<Point>): Array<Point> {
        var _points = [];
        for (var i = 0; i < anchors.length - 3; i++) {
            var diff = Math.abs(anchors[i + 1][1] - anchors[i + 2][1]);
            for (var j = 0; j < diff; j++) {
                var pi = this.interpolate(anchors[i], anchors[i + 1], anchors[i + 2], anchors[i + 3], j / diff);
                _points.push([pi[0], pi[1], 0, 0, 0]);
            }
        }
        return _points;
    }

    drawPath(canvas: HTMLCanvasElement, points: Array<Point>, clearBeforeDraw: boolean) {
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
    }
}

interface Point {

}