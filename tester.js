import {colormap} from "./colormap.js";
import {hsvToRgb} from "./colormap.js";
import {rgbToHsv} from "./colormap.js";

let rgb = [255,107,0];
let hsv = rgbToHsv(rgb,true);
let rgb2 = hsvToRgb(hsv,true);
console.log("Test conversion:");
console.log("RGB" , rgb , "=> HSV" , hsv , "=> RGB" , rgb2);

let value = 40;
let cmap = "temperature";
console.log("Interpolated color " , colormap(value,cmap));