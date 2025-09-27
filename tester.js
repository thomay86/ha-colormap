import {colormap} from "./colormap.js";
import {hsvToRgb} from "./colormap.js";
import {rgbToHsv} from "./colormap.js";

let rgb = [255,107,0];
let hsv = rgbToHsv(rgb);
let rgb2 = hsvToRgb(hsv);
console.log("Test conversion:");
console.log("RGB " + rgb + " => HSV " + hsv + " => RGB " + rgb2);

let value = 50.0;
let cmap = "test";
console.log("Interpolated color:");
console.log(colormap(value,cmap));