## Live Demo
[link](https://liyinz.github.io/cti-color-slider/demo/)

## How to Use

`bower install ctiColorSlider --save`

Include `ctiColorSlider` in your angular dependency array, as demonstrated in
[demo/app.js](demo/app.js).

Use `cti-color-slider` as an attribute directive, like `<div cti-color-slider></div>`

#### API
API is exposed via the `cti-color-slider` attribute, as demonstrated in the demo
files: `cti-color-slider="main.colorData"`, where color data is an object with
color picker coordinates and rgba value, coming from `cti-color-slider`
directive's parent.

2 way data-binding meaning it updates color data from `cti-color-slider` directive's parent automatically, where you can capture and store the updated value.

If no pre-defined color data provided, color picker will pick a random color each time it reloads.

#### Selected Color
Selected color can be displayed in an element with an `id="cp-color-display"`,
provided it has width and height, since the color is shown with css `background`
property.

The element should be included on the same page as the directive.

#### Color Picker size
Size is based on css `width` property under `[cti-color-slider]`.

## Styles

Bare minimum css style for the color picker directive is included. You could
include the provided css or copy and modify them in your own css.

You can style on top of the provided style or however you see fit.

Style for selected color display is up to the user but example can be found in
[demo/client.css](demo/client.css). This provides a flexible way for styling
content outside of the color picker.

