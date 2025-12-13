# ha-colormap
A JavaScript resource to add value/color maps to Home Assistant Lovelace dashboards, especially the versatile [button-card](https://github.com/custom-cards/button-card). In contrast to the button-card `state` definitions, the script generates a continuous color gradient.

## How to install
Copy `colormap.js` to your Home Assistant `/config/www` folder. In your Lovelace dashboard, go to 'edit' (upper right corner), choose 'manage resources', and add as a new resource `/local/colormap.js` (Type: JS-Module).

## How to use in Home Assistant (button-card example)
The example shows how to color a thermometer symbol according to a measured temperature. In Lovelace, the code for the card is:

```yaml
type: custom:button-card
show_state: true
show_name: false
entity: input_number.temperature_test
icon: mdi:thermometer
state_display: >
  [[[ return entity.state + "°C maps to " +
  colormap(entity.state,'temperature'); ]]]
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
        "interpolation_mode2":"long",
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
        "interpolation_mode2":"short",
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
Power examples:

<img width="230" height="212" alt="773W" src="https://github.com/user-attachments/assets/a9bc26f7-ebaa-4d3e-a1dc-3b118666ab0d" />
<img width="232" height="211" alt="331W" src="https://github.com/user-attachments/assets/bd340b72-bed5-42dd-884f-32f349dbc25e" />
<img width="240" height="209" alt="106W" src="https://github.com/user-attachments/assets/5f85bc3b-a85d-448f-bed9-234228b21ccc" />
<img width="198" height="209" alt="0W" src="https://github.com/user-attachments/assets/b1883ae3-a973-4539-b814-a4498b531612" />

Temperature examples:

<img width="228" height="202" alt="+30" src="https://github.com/user-attachments/assets/db67e502-d4ef-4d28-bd39-0d1dfe3bf964" />
<img width="221" height="203" alt="+20" src="https://github.com/user-attachments/assets/29e1b398-646b-4ce5-b527-c80af8158299" />
<img width="227" height="200" alt="+10" src="https://github.com/user-attachments/assets/a0f66a03-bf7b-4e67-88df-7276c664d2b5" />
<img width="239" height="206" alt="+0" src="https://github.com/user-attachments/assets/a0bac156-b13a-4f61-8971-8de9c0ff512d" />
<img width="241" height="205" alt="-30" src="https://github.com/user-attachments/assets/09b663f2-f0d3-436d-9e13-489757739772" />

Example section from my dashboard:

<img width="422" height="276" alt="example" src="https://github.com/user-attachments/assets/78a4867f-0eda-4326-81cf-42ac7102f09c" />

The following entries are available:

| entry  | description |
| :--- | :--- |
| `colorspace`  | The colorspace in which the mapping colors are defined. Currently supported: `RGB` (red, green, blue, each in [0,255]) and `HSV` (hue [0,360]°, saturation [0,100]%, value [0,100]%).  |
| `interpolation_mode` | The colorspace in which the interpolation takes place. Currently supported: `HSV`, `RGB`. |
| `interpolation_mode2` | The sub-mode of interpolation. For `HSV`, these are `short` (shorter arc), `long` (longer arc), `inc` (increasing arc), `dec` (decreasing arc). For `RGB`, specify the gamma value  (`float`, typical: 2.2; 1.0 will give linear interpolation). |
| `mapping` | An array of tuples defining pairs of (value, color). The color itself is an array specified to the defined `colorspace`, thus `[R,G,B]` or `[H,S,V]`. You can not mix colorspaces. |
| `too_high_color` | The color which shall be used if the value is >= the highest specified mapping value. |
| `too_low_color` | The color which shall be used if the value is < the lowest specified mapping value. |

For more information regarding the color interpolation in HSV colorspace, check out e.g. [this link](https://facelessuser.github.io/coloraide/interpolation/#hue-interpolation). I recommend using the shorter arc `sho` if more than two reference points are given in the mapping; use the longer arc `lon` for only two reference points.

For getting a hold of other color spaces than RGB, check out [this link](https://www.hslpicker.com/#c0ff33). For playing around with color gradients, I recommend [this link](https://colordesigner.io/gradient-generator).

## Testing/Lovelace caching
Unfortunately, testing your color settings by editing `colormap.js` can be a bit cumbersome due to your browser caching the script file. Therefore, changes in the script file are not directly reflected in your browser. To circumvent this, two methods are available:

* In Lovelace, go to 'manage resources' again, click on the `/local/colormap.js` entry, and change the string to something like `/local/colormap.js?ver=2` (you can use anything behind the `?`, I basically start incrementing the number). Go back to your dashboard and refresh.
* In your browser, disable caching for your dashboard. In Google Chrome, open your dashboard, then open the developer tools (Ctrl + Shift + I), navigate to the 'Network' tab, and choose 'Disable cache'. This way, the cache for this site is disabled, as long as the dev tools window is open.

## Updating
When a new version of the code is available, ***first make a backup copy of your individual colormap.js***!

Overwrite the existing `colormap.js` with the new one and replace the JSON part with the JSON from your backup file. Remember to force-update the cached file as described above.

I am not satisfied with the user-defined JSON being inside the main JavaScript file, but I didn't find a way yet to split the file, because it seems Home Assistant doesn't allow the script file to access any other file. If you know a way, please let me know ;-)





