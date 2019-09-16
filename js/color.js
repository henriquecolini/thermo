function decomposeIntColor(integer) {
    return { R: integer >> 16, G: integer >> 8 & 0xff, B: integer & 0xff };
}
function parseHexColor(hexColor) {
    var colorStr = hexColor.replace('#', '');
    var colorInt = parseInt(colorStr, 16);
    return decomposeIntColor(colorInt);
}
function color(color) {
    if (typeof color === "number")
        return decomposeIntColor(color);
    else if (typeof color === "string")
        return parseHexColor(color);
}
function colorToHex(color) {
    var r = Math.max(Math.min(color.R, 255), 0).toString(16);
    var g = Math.max(Math.min(color.G, 255), 0).toString(16);
    var b = Math.max(Math.min(color.B, 255), 0).toString(16);
    if (r.length < 2)
        r = '0' + r;
    if (g.length < 2)
        g = '0' + g;
    if (b.length < 2)
        b = '0' + b;
    return "#" + r + g + b;
}
//# sourceMappingURL=color.js.map