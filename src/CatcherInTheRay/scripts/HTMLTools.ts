function CreateCanvas(inWidth: number, inHeight: number, debug: boolean = false): HTMLCanvasElement {
    var canvas = document.createElement("canvas");
    canvas.classList.add("DEBUG");
    canvas.width = inWidth;
    canvas.height = inHeight;
    if (debug) {
        document.body.appendChild(canvas);
    }
    return canvas;
}

function Cast<T>(item: any): T {
    return item;
}

function GetDataOfCanvas(index: number): any {
    var c = document.getElementsByTagName("canvas")[index];
    var ctx = c.getContext("2d");
    var imgData = ctx.getImageData(0, 0, c.width, c.height);
    return [c, ctx, imgData];
}

function Trace(message: string) {
    this.TRACES = this.TRACES || {};

    if (this.TRACES[message]) {
        delete this.TRACES[message];
        var depth = "";
        for (var i = 0; i < Object.keys(this.TRACES).length; i++) depth += ">";
        console.log(depth + message + " finished.");
        console.timeEnd(message);
    } else {
        var depth = "";
        for (var i = 0; i < Object.keys(this.TRACES).length; i++) depth += ">";
        console.log("Starting " + depth + message + ".");
        console.time(message);
        this.TRACES[message] = message;
    }
}