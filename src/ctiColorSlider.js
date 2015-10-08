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
      var csContainer = element[0];
      console.log(element);
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
        [0, 'rgba(255,0,0,1)'],
        [0.15, 'rgba(255,0,255,1)'],
        [0.33, 'rgba(0,0,255,1)'],
        [0.49, 'rgba(0,255,255,1)'],
        [0.67, 'rgba(0,255,0,1)'],
        [0.84, 'rgba(255,255,0,1)'],
        [1, 'rgba(255,0,0,1)']
      ];
      var colorData = cs.colorData || {
        cv0_x: getRandomInt(0, csWidth),
        cv1_x: getRandomInt(0, csWidth)
      };
      cv0.width = cv1.width = csWidth; // slider width defined by container width
      cv0.height = cv1.height = csHeight;
      cv0.offsetRight = cv0.offsetLeft + cv0.width;
      cv1.offsetRight = cv1.offsetLeft + cv1.width;
      /**
       * Color slider interface initialization
       */
      renderGradientSlider(ctx1, csWidth, csHeight, specColorStops);
      var specRgba = getCanvasRgba(ctx1, colorData.cv1_x, 1);
      renderGradientSlider(ctx0, csWidth, csHeight, grdColorStops(specRgba));
      picker0.style.top = cv0.offsetTop - pickerRadius+2 + 'px';
      picker1.style.top = cv1.offsetTop - pickerRadius+2 + 'px';
      updatePickerPos(picker0, absX(cv0, colorData.cv0_x));
      updatePickerPos(picker1, absX(cv1, colorData.cv1_x));
      colorData.rgba = colorData.rgba ||
        getCanvasRgba(ctx0, colorData.cv0_x, 1);
      displayColor(colorData.rgba);

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function getCanvasRgba(ctx, cvX, cvY) {
        var pixel = ctx.getImageData(cvX, cvY, 1, 1);
        var data = pixel.data;
        return 'rgba('+data[0]+','+data[1]+','+data[2]+','+data[3]+')';
      }

      function grdColorStops(rgba) {
        return [[0, 'rgba(0,0,0,1)'], [0.5, rgba], [1, 'rgba(255,255,255,1)']];
      }

      // createLinearGradient(x1, y1, x2, y2)
      function renderGradientSlider(ctx, width, height, colorStops) {
        var grd = ctx.createLinearGradient(0, 0, width, 0);
        ctx.clearRect(0, 0, width, height);
        colorStops.forEach(function(stop) {
          grd.addColorStop(stop[0], stop[1]);
        });
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height)
      }
      function updatePickerPos(picker, x) {
        picker.style.left = x - pickerRadius + 'px';
      }
      function displayColor(rgba) { colorDisplay.style.background = rgba; }
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


      // init touch events
      var hm = new Hammer(csContainer);
      hm.on('tap', csHandleSlider);
      hm.on('pan', csHandleSlider);

      function grdSliderEvent(e) {
        var x = bound(cv0, e.center.x, 'offsetLeft', 'offsetRight');
        updatePickerPos(picker0, x);
        var canvasX = cvX(cv0, x);
        var rgba = getCanvasRgba(ctx0, canvasX, 1);
        displayColor(rgba);
        if (e.isFinal) {
          colorData.cv0_x = canvasX;
          colorData.rgba = rgba;
        }
      }

      function specSliderEvent(e) {
        var x = bound(cv1, e.center.x, 'offsetLeft', 'offsetRight');
        updatePickerPos(picker1, x);
        var canvasX = cvX(cv1, x);
        var colorStops = grdColorStops(getCanvasRgba(ctx1, canvasX, 1));
        renderGradientSlider(ctx0, csWidth, csHeight, colorStops);
        var rgba = getCanvasRgba(ctx0, colorData.cv0_x, 1);
        displayColor(rgba);
        if (e.isFinal) {
          colorData.cv1_x = canvasX;
          colorData.rgba = rgba;
        }
      }

      // function sliderEvents(e, canvas, cId, ctx, picker) {
      //   var x = bound(canvas, e.center.x, 'offsetLeft', 'offsetRight');
      //   updatePickerPos(picker, x);
      //   var canvasX = cvX(canvas, x);
      //   var rgba = getCanvasRgba(ctx, canvasX, 1);
      //   displayColor(rgba);
      //   if (e.isFinal) {
      //     if (cId) colorData.cv1_x = canvasX; // if cId is 1;
      //     else colorData.cv0_x = canvasX; // if cId is 0;
      //     colorData.rgba = rgba;
      //   }
      // }

      function csHandleSlider(e) {
        if (e.type == 'tap') console.log(e);
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

