const cc = {
    "electricpower": {
        "colorspace":"HSV",
        "interpolation_mode":"HSVlong",
        "axis":"lin",
        "mapping":[
            [25,[240,100,100]],
            [800,[300,100,100]]
        ],
        "too_high_color":[240,0,100],
        "too_low_color":[240,100,0]
    }
}

!function() {
    'use strict'

    let debug = true;

    function colormap(val,cmap="electricpower",round=true) {
        // choose selected map from collection
        let cm = cc[cmap];

        // get abscissa values from 2D array
        let abscissa = cm.mapping.map(d => d[0]);
        let colors = cm.mapping.map(d => d[1]);

        // iterate through abscissa to find nearest (lower) neighbor
        let u = abscissa.length;
        let i = -1;
        for (const a of abscissa) {
            if (val >= a) {
                i++;
            } else {
                break;
            }
        }

        // catch values out of specified map range
        let oob = false; // out of bounds
        let color_interp;
        let color_interp_rgb;

        if (i === -1) {
            oob = true;
            color_interp = cm.too_low_color;
        } else if (i >= (u-1)) {
            oob = true;
            color_interp = cm.too_high_color;
        }

        if (debug) {
            console.log("i / u");
            console.log(i + " / " + u);
        }

        // interpolate only if value within abscissa bounds
        if (!oob) {
            // get bounding values and colors
            let val_lb = abscissa[i];
            let val_ub = abscissa[i + 1];
            let color_lb = colors[i];
            let color_ub = colors[i + 1];

            // convert colors to appropriate color space
            let color_lb_intpmode;
            let color_ub_intpmode;
            switch (cm.interpolation_mode) {
                case "HSVshort":
                case "HSVlong":
                    switch (cm.colorspace) {
                        case "HSV":
                            color_lb_intpmode = color_lb;
                            color_ub_intpmode = color_ub;
                            break;
                        case "RGB":
                            color_lb_intpmode = rgbToHsv(color_lb);
                            color_ub_intpmode = rgbToHsv(color_ub);
                            break;
                    }
                    break;
            }

            // interpolation factor [0,1)
            let x = (val - val_lb) / (val_ub - val_lb);
            switch (cm.interpolation_mode) {
                case "HSVshort":
                case "HSVlong":
                    color_interp = [
                        interp_linear(x, color_lb_intpmode[0], color_ub_intpmode[0]),
                        interp_linear(x, color_lb_intpmode[1], color_ub_intpmode[1]),
                        interp_linear(x, color_lb_intpmode[2], color_ub_intpmode[2])
                    ];
                    break;
            }

            switch (cm.interpolation_mode) {
                case "HSVshort":
                case "HSVlong":
                    color_interp_rgb = hsvToRgb(color_interp, round);
                    break;
            }

            if (debug) {
                console.log("Value bounds");
                console.log([val_lb, val_ub]);
                console.log("Color bounds (" + cm.interpolation_mode + "): ");
                console.log([color_lb_intpmode, color_ub_intpmode]);
                console.log("interpolation factor");
                console.log(x);
                console.log("interpolated color (" + cm.interpolation_mode + ")");
                console.log(color_interp);
            }
        } else {
            switch (cm.colorspace) {
                case "HSV":
                    color_interp_rgb = hsvToRgb(color_interp, round);
                    break;
                case "RGB":
                    color_interp_rgb = color_interp;
                    break;
            }
        }

        // always return rgb value for use in HA
        return "rgb(" + color_interp_rgb + ")";
    }

    // linear interpolation for x [0,1) between lower and upper bound
    function interp_linear(x,l,u) {
        return l + x*(u-l);
    }

    /*
    color conversion functions
    refer to https://www.hslpicker.com/#ff0000 for comparison
     */

    /* conversion from RGB to HSL/HSV taken from
    https://de.wikipedia.org/wiki/HSV-Farbraum#Umrechnung_RGB_in_HSV/HSL
    H - Hue [0°,360°) with 0° = red, 120° = green, 240° = blue
    S - Saturation [0%,100%]
    L - Lightness [0%, 100%]
    V - Value [0%, 100%]
     */
    function rgbToHslv(rgb,round=false) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);

        let maxEqualMin = (max === min);
        let rEqualGequalB = (r === g && g === b);

        let h;
        if (maxEqualMin || rEqualGequalB) {
            h = 0;
        } else {
            switch (max) {
                case r:
                    h = 60*(0+(g-b)/(max-min));
                    break;
                case g:
                    h = 60*(2+(b-r)/(max-min));
                    break;
                case b:
                    h = 60*(4+(r-g)/(max-min));
                    break;
            }
        }

        if (h < 0) {
            h = h+360;
        }

        let s;
        if (maxEqualMin || rEqualGequalB) {
            s = 0;
        } else {
            s = (max-min)/(1-Math.abs(max+min-1));
        }

        let v = max;
        let l = (max+min)/2;

        let H = h;
        let S = s*100;
        let V = v*100;
        let L = l*100;
        if (round) {
            H = Math.round(H);
            S = Math.round(S);
            V = Math.round(V);
            L = Math.round(L);
        }

        return [H,S,L,V];
    }

    function rgbToHsv(rgb,round=false) {
        let res = rgbToHslv(rgb,round);
        return [res[0], res[1], res[3]];
    }

    function rgbToHsl(rgb,round=false) {
        let res = rgbToHslv(rgb,round);
        return [res[0], res[1], res[2]];
    }

    function hsvToRgb(hsv,round=false) {
        let h = Math.floor(hsv[0]/60);
        let s = hsv[1]/100;
        let v = hsv[2]/100;

        let rgb;
        if (s === 0) {
            rgb = [v,v,v];
        } else {
            let f = (hsv[0] / 60 - h);
            let p = v * (1 - s);
            let q = v * (1 - s * f);
            let t = v * (1 - s * (1 - f));

            switch (h) {
                case 0:
                case 6:
                    rgb = [v, t, p];
                    break;
                case 1:
                    rgb = [q, v, p];
                    break;
                case 2:
                    rgb = [p, v, t];
                    break;
                case 3:
                    rgb = [p, q, v];
                    break;
                case 4:
                    rgb = [t, p, v];
                    break;
                case 5:
                    rgb = [v, p, q];
                    break;
            }
        }

        let R = rgb[0]*255;
        let G = rgb[1]*255;
        let B = rgb[2]*255;
        if (round) {
            R = Math.round(R);
            G = Math.round(G);
            B = Math.round(B);
        }

        return [R,G,B];
    }

    // expose to Home Assistant (not sure what it does, but it works)
    if (typeof exports !== 'undefined') {
        exports['colormap'] = colormap
        exports['rgbToHsv'] = rgbToHsv
        exports['hsvToRgb'] = hsvToRgb
    }

    if (typeof window !== 'undefined') {
        window['colormap'] = colormap

        if (typeof define === 'function' && define['amd']) {
            define(function() {
                return {
                    'colormap': colormap,
                }
            })
        }
    }
}();