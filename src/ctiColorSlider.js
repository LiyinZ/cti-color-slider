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
      templateUrl: './src/ctiColorSlider.html',
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
      var type = 'useRgb' in attrs ? 'rgb' : 'hex';
      var csContainer = element[0];
      var cv0 = csContainer.children[0].children[0];
      var cv1 = csContainer.children[1].children[0];
      var csWidth = csContainer.clientWidth; // width is container width in CSS
      var csHeight = cv0.clientHeight; // slider height is defined in css
      var picker0 = csContainer.children[2];
      var picker1 = csContainer.children[3];
      var pickerRadius = picker0.offsetWidth/2; // radius, half width
      var ctx0 = cv0.getContext('2d');
      var ctx1 = cv1.getContext('2d');
      var specColorStops = [
        [0,   '#F00'],
        [1/6, '#F0F'],
        [2/6, '#00F'],
        [0.5, '#0FF'],
        [4/6, '#0F0'],
        [5/6, '#FF0'],
        [1,   '#F00']
      ];
      var csCoords = {};
      cv0.height = cv1.height = csHeight; // this sets both canvas height
      cv0.width = cv1.width = csWidth; // set canvas width, necessary
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

      scope.$watch('cs.colorData', function() {
        updateSlider();
      });

      function initSlider() {
        renderLinearGrdSlider(ctx1, csWidth, csHeight, specColorStops);
        picker0.style.top = cv0.offsetTop - pickerRadius+2 + 'px';
        picker1.style.top = cv1.offsetTop - pickerRadius+2 + 'px';
        picker0.style.opacity = picker1.style.opacity = 1;
        updateSlider();
      }

      function updateSlider() {
        if (!cs.colorData) csCoords.x0 = csCoords.x1 = 0;
        else if (cs.colorData[type]) setSliderCoords(cs.colorData[type]);
        else randSliderCoords();
        var specRgb = renderBrightnessSlider(csCoords.x1);
        var rgbStr = cs.colorData && cs.colorData[type] ?
          cs.colorData[type] : updateColorData(csCoords.x0);
        updatePicker(picker0, csCoords.x0, rgbStr);
        updatePicker(picker1, csCoords.x1, specRgb);
      }

      function updateColorData(x0) {
        var rgb = getCanvasRgb(ctx0, x0, 1);
        var rgbStr = rgbToStr(rgb);
        if (cs.colorData)
          cs.colorData[type] = type == 'hex' ? rgbToHex(rgb, true) : rgbStr;
        return rgbStr;
      }

      function renderBrightnessSlider(x1) {
        var specRgb = rgbToStr(getCanvasRgb(ctx1, x1, 1));
        renderLinearGrdSlider(ctx0, csWidth, csHeight, grdColorStops(specRgb));
        return specRgb;
      }


      function setSliderCoords(color) {
        var rgb = type == 'hex' ? hexToRgb(color) : rgbStrToRgb(color);
        var ratios = rgbToSlidersRatio(rgb);
        csCoords.x1 = ratioToPos(ratios[1]);
        csCoords.x0 = ratioToPos(ratios[0]);
      }

      function randSliderCoords() {
        csCoords.x1 = getRandomInt(0, csWidth);
        csCoords.x0 = getRandomInt(0, csWidth);
      }

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function getCanvasRgb(ctx, cvX, cvY) {
        var pixel = ctx.getImageData(cvX, cvY, 1, 1);
        return pixel.data.slice(0, -1);
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
      function updatePicker(picker, cvX, rgbStr) {
        picker.style.left = cvX - pickerRadius + 'px';
        picker.style.background = rgbStr;
      }
      /**
       * Turn absolute screen x to canvas relative x
       * @param {Number} x absolute coordinate
       * @return {Number} x relative to given canvas
       */
      function cvX(x) { return x - csContainer.offsetLeft; }

      /**
       * Give canvas a boundary for drag, pan event
       * @param {Number} x coord from an event
       * @return {Number} x coord - a coord that's within color slider width
       */
      function bound(x) {
        return x < 0 ? 0 : x >= csWidth ? csWidth - 1 : x;
      }

      /**
       * @param {Canvas} canvas - specify canvas
       * @param {Number} ratio - slider percentage position, from
       * rgbToSlidersRatio
       * @return {Integer} canvas pixel x position
       */
      function ratioToPos(ratio) {
        return bound(Math.round(ratio * csWidth));
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
        if (max <= t && min === 0) {
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
        if (rgb[0] >= rgb[1] && rgb[1] > rgb[2]) return 5;
        return 6;
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

      function rgbToHex(rgb, sign) {
        var hex = toHex(rgb[0])+toHex(rgb[1])+toHex(rgb[2]);
        return sign ? '#' + hex : hex;
      }
      // rgbToHex helper
      function toHex(n) {
        n = parseInt(n).toString(16);
        return n.length == 1 ? '0' + n : n;
      }

      function rgbToStr(rgb) { return 'rgb(' + rgb.join() + ')'; }

      function rgbStrToRgb(rgbStr) {
        return rgbStr.match(/\d+/g).map(function(n) {
          return parseInt(n);
        });
      }

      /**
       * Init touch events
       */
      var hm = new Hammer(csContainer);
      hm.on('tap', csHandleSlider);
      hm.on('pan', csHandleSlider);

      function grdSliderEvent(e, x) {
        x = x || bound(cvX(e.center.x));
        var rgbStr = updateColorData(x);
        updatePicker(picker0, x, rgbStr);
        scope.$apply();
        csCoords.x0 = x;
      }

      function specSliderEvent(e) {
        var x = bound(cvX(e.center.x));
        var specRgb = renderBrightnessSlider(x);
        updatePicker(picker1, x, specRgb);
        picker0.style.background = updateColorData(csCoords.x0);
        scope.$apply();
        if (e.isFinal) csCoords.x1 = x;
      }

      function csHandleSlider(e) {
        if (e.tapCount == 2) return grdSliderEvent(e, csWidth/2);
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

