/*
JavaScript code for color mapping Home Assistant Lovelace cards
created by Thomas May (2025) under the MIT License
*/

/*
### BEGINNING OF USER-DEFINED JSON SECTION ###
### colorspace options: RGB, HSV
### interpolation_mode: HSV
    interpolation_mode2: short, long (short or long arc)
### interpolation_mode: RGB
    interpolation_mode2: [float] (specify gamma value; 1.0 for linear interpolation, 2.2 for more perceptual gradient)
### vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv ###
*/

const cc = {
    "electricpower": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"long",
        "mapping":[
            [25,[240,80,100]],
            [800,[340,80,100]]
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[240,80,10]
    },
    "heating_kw": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"long",
        "mapping":[
            [0.1,[360,80,20]],
            [2,[360,80,100]]
        ],
        "too_high_color":[360,80,100],
        "too_low_color":[360,80,0]
    },
    "heating_percent": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"long",
        "mapping":[
            [1,[360,80,20]],
            [100,[360,80,100]]
        ],
        "too_high_color":[360,80,100],
        "too_low_color":[360,80,0]
    },
    "boiler_temperature": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"long",
        "mapping":[
            [20,[210,80,100]],
            [70,[360,80,100]]
        ],
        "too_high_color":[360,80,100],
        "too_low_color":[210,80,100]
    },
    "temperature": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [-5,[300,80,100]],
            [0,[240,0,100]],
            [10,[180,80,100]],
            [21,[120,80,100]],
            [40,[300,80,100]]
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[300,80,100]
    },
    "dewpoint": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [-5,[300,80,100]],
            [0,[240,0,100]],
            [6,[180,80,100]],
            [12,[120,80,100]],
            [24,[300,80,100]]
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[300,80,100]
    },
    "wetbulb": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [-5,[300,80,100]],
            [0,[240,0,100]],
            [10,[180,80,100]],
            [16,[120,80,100]],
            [24,[300,80,100]]
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[300,80,100]
    },
    "humidity": {
        "colorspace":"RGB",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [10,[128,0,255]],
            [40,[0,255,255]],
            [55,[0,255,0]],
            [100,[255,0,255]]
        ],
        "too_high_color":[255,0,255],
        "too_low_color":[128,0,255]
    },
    "pressure": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [990,[300,80,100]],
            [1013,[120,80,100]],
            [1040,[300,80,100]]
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[300,80,100]
    },
    "percent": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [0,[0,100,100]],
            [100,[120,100,100]]
        ],
        "too_high_color":[120,100,100],
        "too_low_color":[0,100,100]
    },
    "percent_reverse": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"short",
        "mapping":[
            [0,[120,100,100]],
            [100,[0,100,100]]
        ],
        "too_high_color":[0,100,100],
        "too_low_color":[120,100,100]
    },
    "pm25": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"dec",
        "mapping":[
            [5,[120,80,100]],
            [20,[60,80,100]],
            [50,[30,80,100]],
            [75,[0,80,100]],
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[120,80,100]
    },
    "voc": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"dec",
        "mapping":[
            [50,[120,80,100]],
            [100,[60,80,100]],
            [150,[30,80,100]],
            [300,[0,80,100]],
        ],
        "too_high_color":[300,80,100],
        "too_low_color":[120,80,100]
    }
}

/*
## ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ###
## END OF USER-DEFINED JSON SECTION ###
*/

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
            console.log("Array indices i =", i, "u =", u);
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
                case "HSV":
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
                case "RGB":
                    switch (cm.colorspace) {
                        case "HSV":
                            color_lb_intpmode = hsvToRgb(color_lb);
                            color_ub_intpmode = hsvToRgb(color_ub);
                            break;
                        case "RGB":
                            color_lb_intpmode = color_lb;
                            color_ub_intpmode = color_ub;
                            break;
                    }
            }

            // interpolation factor [0,1)
            let x = (val - val_lb) / (val_ub - val_lb);
            switch (cm.interpolation_mode) {
                case "HSV":
                    let h = interp_circular(x, color_lb_intpmode[0], color_ub_intpmode[0],cm.interpolation_mode2);
                    let s = interp_linear(x, color_lb_intpmode[1], color_ub_intpmode[1]);
                    let v = interp_linear(x, color_lb_intpmode[2], color_ub_intpmode[2]);
                    color_interp = [h,s,v];
                    break;
                case "RGB":
                    let r = interp_rgb(x, color_lb_intpmode[0], color_ub_intpmode[0],cm.interpolation_mode2);
                    let g = interp_rgb(x, color_lb_intpmode[1], color_ub_intpmode[1],cm.interpolation_mode2);
                    let b = interp_rgb(x, color_lb_intpmode[2], color_ub_intpmode[2],cm.interpolation_mode2);
                    color_interp = [r,g,b];
                    break;
            }

            switch (cm.interpolation_mode) {
                case "HSV":
                    color_interp_rgb = hsvToRgb(color_interp, round);
                    break;
                case "RGB":
                    color_interp_rgb = rgbCleanup(color_interp, round);
                    break;
            }

            if (debug) {
                console.log("Value bounds", [val_lb, val_ub]);
                console.log("Color bounds (" , cm.interpolation_mode , "):", [color_lb_intpmode, color_ub_intpmode]);
                console.log("interpolation factor", x);
                console.log("interpolated color (" + cm.interpolation_mode + ")", color_interp);
            }
        } else {
            switch (cm.colorspace) {
                case "HSV":
                    color_interp_rgb = hsvToRgb(color_interp, round);
                    break;
                case "RGB":
                    color_interp_rgb = rgbCleanup(color_interp, round);
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

    // RGB interpolation (mode2 = gamma value, 1.0 = linear)
    function interp_rgb(x,l,u,gamma) {
        return (((l + x*(u-l))/255)**gamma)*255;
    }

    // circular interpolation for x [0,1) - assuming x = [0,360°]
    // written for u > l, but also works the other way round
    function interp_circular(x,l,u,mode) {
        let da = u - l;

        // check whether shorter arc equals the increasing arc, taken from
        // https://developer.mozilla.org/en-US/docs/Web/CSS/hue-interpolation-method
        let sho_inc = ((da > 0 && da < 180) || (da < -180));

        // match modes with only increasing/decreasing arc
        let use_increasing_arc;
        switch (mode) {
            case "inc":
                use_increasing_arc = true;
                break;
            case "dec":
                use_increasing_arc = false;
                break;
            case "short":
                use_increasing_arc = sho_inc;
                break;
            case "long":
                use_increasing_arc = !sho_inc;
                break;
        }

        // shorter and longer arc lengths (negative sign: counter-clockwise)
        let da_inc = (360 + da) % 360;
        let da_dec = -(360-da_inc);
        let result = (l + x*(use_increasing_arc ? da_inc : da_dec) + 360) % 360;

        if (debug) {
            console.log("Shorter arc is the increasing one?", sho_inc);
            console.log("Use increasing arc?", use_increasing_arc);
            console.log("da=",da);
            console.log("da_inc=",da_inc);
            console.log("da_dec=",da_dec);
            console.log("result=",result);
        }

        return result;
    }

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

    function rgbCleanup(rgb, round = false) {
        if (round) {
            return [Math.round(rgb[0]),Math.round(rgb[1]),Math.round(rgb[2])];
        } else {
            return rgb;
        }

    }

    /* conversion from HSL/HSV to RGB taken from
    https://de.wikipedia.org/wiki/HSV-Farbraum#Umrechnung_HSV_in_RGB
    H - Hue [0°,360°) with 0° = red, 120° = green, 240° = blue
    S - Saturation [0%,100%]
    L - Lightness [0%, 100%]
    V - Value [0%, 100%]
     */
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
    // snippet taken from https://github.com/alexei/sprintf.js/blob/3a0d8c26d291b5bd9f1974877ecc50739921d6f5/src/sprintf.js
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