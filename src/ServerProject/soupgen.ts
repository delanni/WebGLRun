
var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function Generate(length: number) {
    var out = "";
    for (var i = 0; i < length; i++) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
}