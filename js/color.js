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
//# sourceMappingURL=color.js.map