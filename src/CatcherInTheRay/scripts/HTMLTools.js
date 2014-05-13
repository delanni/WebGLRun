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
