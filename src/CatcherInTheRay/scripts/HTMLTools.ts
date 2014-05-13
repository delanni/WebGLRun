function CreateCanvas(inWidth:number, inHeight:number, debug:boolean = false):HTMLCanvasElement {
    var canvas = document.createElement("canvas");
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