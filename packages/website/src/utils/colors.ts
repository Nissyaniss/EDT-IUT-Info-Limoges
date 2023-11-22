function componentToHex(c: number) {
  try {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  catch {
    return "00";
  }
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}