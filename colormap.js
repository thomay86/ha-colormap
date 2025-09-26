!function() {
    'use strict'

    function colormap(x) {
        // `arguments` is not an array, but should be fine for this call
        return x
    }
    
    // expose to Home Assistant (not sure what it does, but it works)
    if (typeof exports !== 'undefined') {
        exports['colormap'] = colormap
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
