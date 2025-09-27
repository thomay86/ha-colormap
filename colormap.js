const cc = {
    "test": {
        "colorspace":"RGB",
        "interpolation_mode":"HSVlong",
        "axis":"lin",
        "mapping":[
            [0,[255,0,0]],
            [100,[255,213,0]]
        ],
        "too_high_color":[255,0,0],
        "too_low_color":[255,0,255]
    }
}

!function() {
    'use strict'

    function colormap(val,cmap = "test") {
        // choose selected map from collection
        let cm = cc[cmap];

        // get abscissa values from 2D array
        let abscissa = cm.mapping.map(d => d[0]);
        let colors = cm.mapping.map(d => d[1]);

        // iterate through abscissa to find nearest (lower) neighbor
        let i = -1;
        for (const a of abscissa) {
            if (val >= a) {
                i++;
            } else {
                break;
            }
        }

        // get bounding values and colors
        let val_lb = abscissa[i];
        let val_ub = abscissa[i+1];
        let color_lb = colors[i];
        let color_ub = colors[i+1];

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

        console.log("Value bounds");
        console.log([val_lb,val_ub]);
        console.log("Color bounds (" + cm.interpolation_mode + "): ");
        console.log([color_lb_intpmode,color_ub_intpmode]);

        // interpolation factor [0,1)
        let x = (val-val_lb)/(val_ub - val_lb);
        console.log(x);

        let color_interp;
        switch (cm.interpolation_mode) {
            case "HSVshort":
            case "HSVlong":
                color_interp = [
                    interp_linear(x,color_lb_intpmode[0],color_ub_intpmode[0]),
                    interp_linear(x,color_lb_intpmode[1],color_ub_intpmode[1]),
                    interp_linear(x,color_lb_intpmode[2],color_ub_intpmode[2])
                ];
                break;

        }

        let color_interp_rgb;
        switch (cm.interpolation_mode) {
            case "HSVshort":
            case "HSVlong":
                color_interp_rgb = hsvToRgb(color_interp);
                break;
        }

        // always return rgb value for use in HA
        return color_interp_rgb;
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
    function rgbToHslv(rgb) {
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

        return [h, s*100, l*100, v*100];
    }

    function rgbToHsv(rgb) {
        let res = rgbToHslv(rgb);
        return [res[0], res[1], res[3]];
    }

    function rgbToHsl(rgb) {
        let res = rgbToHslv(rgb);
        return [res[0], res[1], res[2]];
    }

    function hsvToRgb(hsv) {
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

        return [rgb[0]*255,rgb[1]*255,rgb[2]*255];
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