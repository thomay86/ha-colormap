# ha-colormap
A JavaScript resource to add value/color maps to Home Assistant Lovelace dashboards, especially the versatile [button-card](https://github.com/custom-cards/button-card). In contrast to the button-card `state` definitions, the script generates a continuous color gradient.

## How to install
Copy `colormap.js` to your Home Assistant `/config/www` folder. In your Lovelace dashboard, go to 'edit' (upper right corner), choose 'manage resources', and add as a new resource `/local/colormap.js` (Type: JS-Module).

## How to use in Home Assistant (button-card example)
The example shows how to color a thermometer symbol according to a measured temperature. In Lovelace, the code for the card is:

```yaml
type: custom:button-card
entity: input_number.mytemperature
icon: mdi:thermometer
styles:
  icon:
    - color: "[[[ return colormap(entity.state,'temperature'); ]]]"
```

Note that the icon has to be colored using the `styles` entry and not via `state` operators from button-card itself. The function `colormap` currently uses two arguments: the actual value of the entity, and the color map to be used (defined below).
Of course it is possible to use this method together with button-card templates, which can dramatically reduce repetitive code in more complex dashboards.

## Color map definitions
The color map itself is defined in `colormap.js` as a JSON object entry:

```javascript
[...]
"electricpower": {
        "colorspace":"HSV",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"lon",
        "mapping":[
            [25,[240,100,100]],
            [800,[340,100,100]]
        ],
        "too_high_color":[300,100,100],
        "too_low_color":[240,100,10]
    },
"temperature": {
        "colorspace":"RGB",
        "interpolation_mode":"HSV",
        "interpolation_mode2":"sho",
        "mapping":[
            [-10,[128,0,255]],
            [0,[255,255,255]],
            [10,[0,255,255]],
            [21,[0,255,0]],
            [40,[255,0,255]]
        ],
        "too_high_color":[255,0,255],
        "too_low_color":[128,0,255]
    },
[...]
```

The following entries are available:

| entry  | description |
| :--- | :--- |
| `colorspace`  | The colorspace in which the mapping colors are defined. Currently supported: `RGB` (red, green, blue, each in [0,255]) and `HSV` (hue [0,360]°, saturation [0,100]%, value [0,100]%).  |
| `interpolation_mode` | The colorspace in which the interpolation takes place. Currently supported: `HSV`. |
| `interpolation_mode2` | The sub-mode of interpolation. For `HSV`, these are `sho` (shorter arc), `lon` (longer arc), `inc` (increasing arc), `dec` (decreasing arc). |
| `mapping` | An array of tuples defining pairs of (value, color). The color itself is an array specified to the defined `colorspace`, thus `[R,G,B]` or `[H,S,V]`. You can not mix colorspaces. |
| `too_high_color` | The color which shall be used if the value is >= the highest specified mapping value. |
| `too_low_color` | The color which shall be used if the value is < the lowest specified mapping value. |

For more information regarding the color interpolation in HSV colorspace, check out e.g. [this link](https://facelessuser.github.io/coloraide/interpolation/#hue-interpolation). I recommend using the shorter arc `sho` if more than two reference points are given in the mapping; use the longer arc `lon` for only two reference points.

## Updating
When a new version of the code is available, ***first make a backup copy of your individual colormap.js***!

Overwrite the existing `colormap.js` with the new one and replace the JSON part with the JSON from your backup file. In Lovelace, you will most probably have to force your browser to reload the file: Go to 'manage resources' again, click on the `/local/colormap.js` entry, and change the string to something like `/local/colormap.js?ver=2` (you can use anything behind the `?`). Go back to your dashboard and refresh. 

I am not satisfied with the user-defined JSON being inside the main JavaScript file, but I didn't find a way yet to split the file, because it seems Home Assistant doesn't allow the script file to access any other file. If you know a way, please let me know ;-)
