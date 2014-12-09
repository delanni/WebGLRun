module TERRAIN {
    export class PathGenerator {

        random: IRandomProvider;

        constructor(random: IRandomProvider) {
            this.random = random;
        }

        /**
        * This is the function to generate and draw a path on the canvas
        **/
        MakePath(canvas: HTMLCanvasElement, from, to, opaque: boolean= true) {
            var ctrlPoints = this.GeneratePath(canvas, from, to)
            var cmspline = this.makeCatmull(ctrlPoints);
            this.drawPath(canvas, cmspline, opaque);
            return canvas;
        }

        GeneratePath(canvas: HTMLCanvasElement, from, to): any[] {
            from = from && [from] || [from, from];
            to = to && [to] || [to, to];
            from[0] = from[0] || 0;
            to[0] = to[0] || canvas.width;
            from[1] = from[1] || canvas.height;
            to[1] = to[1] || 0;

            // Total steps to take 
            var STEPS = 10;
            var ITERATIONS = 15;

            // The general direction of the path
            var dx = (to[0] - from[0]) / STEPS;
            var dy = (to[1] - from[1]) / STEPS;

            // The normalof the direction
            var normal = [-dy/2, dx/2];

            // Magnitude of the normal
            var abnormal = [-normal[0], -normal[1]];

            var ctrlPoints = [];
            ctrlPoints.push(from, from);

            var intermediatePoints = [];
            for (var i = 1; i < STEPS; i++) {
                intermediatePoints.push([from[0] + dx * i, from[1] + dy * i]);
            }
            for (var i = 0; i < ITERATIONS; i++) {
                var randomElement = intermediatePoints[Math.floor(this.random.Random() * intermediatePoints.length)];
                var offset = (i % 2) ? normal : abnormal;
                randomElement[0] += offset[0];
                randomElement[1] += offset[1];
            }
            for (var i = 0; i < intermediatePoints.length; i++) {
                ctrlPoints.push(intermediatePoints[i]);
            }

            ctrlPoints.push(to, to);
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

        private drawCatmull(canvas: HTMLCanvasElement, points, xoffset: number) {
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

        private makeCatmull(anchors: Array<any>): Array<any> {
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

        private drawPath(canvas: HTMLCanvasElement, points: Array<any>, clearBeforeDraw: boolean) {
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
}