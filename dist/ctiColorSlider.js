(function() {
  'use strict';

  if (typeof angular === 'undefined') {
      throw Error("CTi Color Slider: AngularJS (window.angular) is undefined but is necessary.");
  }
  if (typeof Hammer === 'undefined') {
    throw Error("CTi Color Slider: HammerJS (window.Hammer) is undefined but is necessary.");
  }

  /**
   * @module ctiColorSlider
   * @description Angular.js directive for mobile touch friendly colour slider
   * made at CTi - Canadian Tire Innovation
   * @requires angular
   * @requires hammer
   */
  angular
    .module('ctiColorSlider', [])
    .directive('ctiColorSlider', ctiColorSlider);

  ctiColorSlider.$inject = [];

  /* @ngInject */
  function ctiColorSlider () {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      // TODO replace templateUrl with template
      template: '<div id=cti-slider-1 class=cti-slider-wrapper><canvas id=cs-canvas-1 class="cti-canvas-slider round-edge">Your browser does not support the HTML5 canvas tag.</canvas></div><div id=cti-slider-2 class=cti-slider-wrapper><canvas id=cs-canvas-2 class="cti-canvas-slider round-edge">Your browser does not support the HTML5 canvas tag.</canvas></div><span id=cti-picker-1 class="cti-cs-picker circular"></span> <span id=cti-picker-2 class="cti-cs-picker circular"></span>',
      bindToController: true,
      controller: ColorSliderCtrl,
      controllerAs: 'cs',
      link: link,
      restrict: 'A',
      scope: {
        colorData: '=ctiColorSlider'
      }
    };
    return directive;

    function link(scope, element, attrs, cs) {
      /**
       * Variables initialization
       */
      var csContainer = element[0];
      var cv0 = csContainer.children[0].children[0];
      var cv1 = csContainer.children[1].children[0];
      var csWidth = cv0.clientWidth; // width is defined in CSS
      var csHeight = cv0.clientHeight;
      var picker0 = csContainer.children[2];
      var picker1 = csContainer.children[3];
      var pickerRadius = picker0.offsetWidth/2; // radius, half width
      var colorDisplay = document.getElementById('cs-color-display');
      var ctx0 = cv0.getContext('2d');
      var ctx1 = cv1.getContext('2d');
      var specColorStops = [
        [0, 'rgb(255,0,0)'],
        [1/6, 'rgb(255,0,255)'],
        [2/6, 'rgb(0,0,255)'],
        [3/6, 'rgb(0,255,255)'],
        [4/6, 'rgb(0,255,0)'],
        [5/6, 'rgb(255,255,0)'],
        [1, 'rgb(255,0,0)']
      ];
      var csCoords = {};
      cv0.width = cv1.width = csWidth; // slider width defined by container width
      cv0.height = cv1.height = csHeight;
      cv0.offsetRight = cv0.offsetLeft + cv0.width;
      cv1.offsetRight = cv1.offsetLeft + cv1.width;
      var hexToR = hexToFn(0, 2);
      var hexToG = hexToFn(2, 4);
      var hexToB = hexToFn(4, 6);
      /**
       * Color slider interface initialization
       */
      angular.element(document).ready(function() {
        initSlider();
      });

      scope.$watch('cs.colorData', function(newData) {
        updateSlider();
      });

      function initSlider() {
        renderLinearGrdSlider(ctx1, csWidth, csHeight, specColorStops);
        picker0.style.top = cv0.offsetTop - pickerRadius+2 + 'px';
        picker1.style.top = cv1.offsetTop - pickerRadius+2 + 'px';
        updateSlider();
      }

      function updateSlider() {
        if (cs.colorData.hex) setSliderCoords(cs.colorData.hex);
        else randSliderCoords();
        var specRgb = renderBrightnessSlider(csCoords.x1);
        var rgbStr = cs.colorData.hex || updateColorHex(csCoords.x0);
        updatePicker(picker0, absX(cv0, csCoords.x0), rgbStr);
        updatePicker(picker1, absX(cv1, csCoords.x1), specRgb);
      }

      function updateColorHex(x0) {
        var rgb = getCanvasRgb(ctx0, x0, 1);
        var rgbStr = rgbToStr(rgb);
        cs.colorData.hex = rgbToHex(rgb[0], rgb[1], rgb[2], true);
        return rgbStr;
      }

      function renderBrightnessSlider(x1) {
        var specRgb = rgbToStr(getCanvasRgb(ctx1, x1, 1));
        renderLinearGrdSlider(ctx0, csWidth, csHeight, grdColorStops(specRgb));
        return specRgb;
      }


      function setSliderCoords(hex) {
        var rgb = hexToRgb(hex);
        var ratios = rgbToSlidersRatio(rgb);
        csCoords.x1 = ratioToPos(cv1, ratios[1]);
        csCoords.x0 = ratioToPos(cv0, ratios[0]);
      }

      function randSliderCoords() {
        csCoords.x1 = getRandomInt(0, cv1.width);
        csCoords.x0 = getRandomInt(0, cv0.width);
      }

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function getCanvasRgb(ctx, cvX, cvY) {
        var pixel = ctx.getImageData(cvX, cvY, 1, 1);
        var data = pixel.data.slice(0, -1);
        return data;
      }

      function grdColorStops(rgb) {
        return [[0, 'rgb(0,0,0)'], [0.5, rgb], [1, 'rgb(255,255,255)']];
      }

      // createLinearGradient(x1, y1, x2, y2)
      function renderLinearGrdSlider(ctx, width, height, colorStops) {
        var grd = ctx.createLinearGradient(0, 0, width, 0);
        ctx.clearRect(0, 0, width, height);
        colorStops.forEach(function(stop) {
          grd.addColorStop(stop[0], stop[1]);
        });
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }
      function updatePicker(picker, x, rgbStr) {
        picker.style.left = x - pickerRadius + 'px';
        picker.style.background = rgbStr;
      }
      function displayColor(color) { colorDisplay.style.background = color; }
      /**
       * Turn absolute screen x to canvas relative x
       * @param {Canvas} canvas canvas element
       * @param {Number} x absolute coordinate
       * @return {Number} x relative to given canvas
       */
      function cvX(canvas, x) { return x - canvas.offsetLeft; }
      /**
       * Opposite of cvX, convert canvas coords to screen coords
       */
      function absX(canvas, x) { return x + canvas.offsetLeft; }

      /**
       * Give canvas a boundary for drag, pan event coords, x or y
       * @param {Canvas} canvas - specify which canvas
       * @param {Number} coord - x or y coord from an event
       * @param {String} upper - canvas property e.g. 'offsetLeft'
       * @param {String} lower - custom canvas property e.g. 'offsetRight'
       * @return {Number} coord - a coord that's within the given canvas
       */
      function bound(canvas, coord, upper, lower) {
        if (coord < canvas[upper]) coord = canvas[upper];
        else if (coord >= canvas[lower]) coord = canvas[lower]-1;
        return coord;
      }

      /**
       * @param {Canvas} canvas - specify canvas
       * @param {Number} ratio - slider percentage position, from
       * rgbToSlidersRatio
       * @return {Integer} canvas pixel x position
       */
      function ratioToPos(canvas, ratio) {
        return canvas, Math.round(ratio * canvas.width);
      }
      // return [brightness, spectrum]
      function rgbToSlidersRatio(rgb) {
        var t = 255; // constant
        function isBlack(element) { return element === 0; }
        function isWhite(element) { return element === t; }
        if (rgb.every(isBlack)) return [0, .5];
        if (rgb.every(isWhite)) return [1, .5];
        var max = Math.max.apply(null, rgb);
        var min = Math.min.apply(null, rgb);
        var mid = rgb.reduce(function(a,b) { return a + b; }) - max - min;
        var zone = spectrumZone(rgb);
        if (max < t && min === 0) {
          if (zone % 2) return [max/t/2, (zone + (1-mid/max)) / 6];
          return [max/t/2, (zone + mid/max) / 6];
        }
        if (min > 0 && max === t) {
          if (zone % 2) return [.5+min/t/2, (zone+(t-mid)/(t-min))/6];
          return [.5+min/t/2, (zone+(1-(t-mid)/(t-min)))/6];
        }
        return [.5, zone/6];
      }
      // helper function for rgbToSlidersRatio
      function spectrumZone(rgb) {
        if (rgb[0] > rgb[2] && rgb[2] >= rgb[1]) return 0;
        if (rgb[2] >= rgb[0] && rgb[0] > rgb[1]) return 1;
        if (rgb[2] > rgb[1] && rgb[1] >= rgb[0]) return 2;
        if (rgb[1] >= rgb[2] && rgb[2] > rgb[0]) return 3;
        if (rgb[1] > rgb[0] && rgb[0] >= rgb[2]) return 4;
        return 5;
      }

      // hexToR, G, B function maker
      function hexToFn(a, b) {
        return function(h) { return parseInt(h.substring(a, b), 16); }
      }
      function hexToRgb(hex) {
        hex = cutHex(hex);
        return [hexToR(hex), hexToG(hex), hexToB(hex)];
      }
      // hexToRgb helper
      function cutHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1,7) : h;
      }

      function rgbToHex(R, G, B, sign) {
        var hex = toHex(R)+toHex(G)+toHex(B);
        if (sign) hex = '#' + hex;
        return hex;
      }
      // rgbToHex helper
      function toHex(n) {
        var hexVals = '0123456789ABCDEF';
        if (isNaN(n)) return '00';
        n = Math.max(0, Math.min(n, 255));
        return hexVals.charAt((n-n%16)/16) + hexVals.charAt(n%16);
      }

      function rgbToStr(rgb) {
        return 'rgb(' + rgb.join(',') + ')';
      }

      /**
       * Init touch events
       */
      var hm = new Hammer(csContainer);
      hm.on('tap', csHandleSlider);
      hm.on('pan', csHandleSlider);

      function grdSliderEvent(e) {
        var x = bound(cv0, e.center.x, 'offsetLeft', 'offsetRight');
        var canvasX = cvX(cv0, x);
        var rgbStr = updateColorHex(canvasX);
        updatePicker(picker0, x, rgbStr);
        scope.$apply();
        if (e.isFinal) csCoords.x0 = canvasX;
      }

      function specSliderEvent(e) {
        var x = bound(cv1, e.center.x, 'offsetLeft', 'offsetRight');
        var canvasX = cvX(cv1, x);
        var specRgb = renderBrightnessSlider(canvasX);
        updatePicker(picker1, x, specRgb);
        picker0.style.background = updateColorHex(csCoords.x0);
        scope.$apply();
        if (e.isFinal) csCoords.x1 = canvasX;
      }

      function csHandleSlider(e) {
        switch(e.target.id) {
          case 'cs-canvas-1':
          case 'cti-picker-1':
          case 'cti-slider-1':
            grdSliderEvent(e);
            break;
          case 'cs-canvas-2':
          case 'cti-picker-2':
          case 'cti-slider-2':
            specSliderEvent(e);
            break;
          default:
            return;
        }
      }

    } // link
  } // directive

  /* @ngInject */
  function ColorSliderCtrl () {

  }
})();

