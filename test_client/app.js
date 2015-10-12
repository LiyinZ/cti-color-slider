(function() {
  'use strict';

  var demo = angular.module('ctiCpDemo', [ 'ctiColorSlider' ]);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope'];

  /* @ngInject */
  function MainCtrl($scope) {
    var vm = this;
    var MAX_COUNT = 8;
    var MIN_COUNT = 1;

    vm.colors = [
      { hex: '#FFF062', rgb: 'rgb(255,141,200)' },
      { hex: '#00E594', rgb: 'rgb(255,240,98)' },
      { hex: '#FF0075', rgb: 'rgb(0,169,180)' }
    ];
    vm.selected = 0;
    vm.colorData = vm.colors[0]; // init selected color to first one;
    vm.disableAdd = maxReached();
    vm.disableRm = minReached();

    vm.selectColor = selectColor;
    vm.isSelected = isSelected;
    vm.addColor = addColor;
    vm.removeColor = removeColor;

    function maxReached() {
      return vm.colors.length == MAX_COUNT;
    }

    function minReached() {
      return vm.colors.length == MIN_COUNT;
    }

    function setBtnState() {
      vm.disableAdd = maxReached();
      vm.disableRm = minReached();
    }

    function selectColor(key) {
      vm.selected = key;
      vm.colorData = vm.colors[key];
    }

    function isSelected(key) {
      return vm.selected == key;
    }

    function addColor() {
      var count = vm.colors.length;
      if (count >= MAX_COUNT) return;
      vm.colors.push({  rgb: 'rgb(255,0,0)' });
      vm.selectColor(count);
      setBtnState();
    }

    function removeColor() {
      var count = vm.colors.length;
      if (count <= MIN_COUNT) return;
      count = vm.selected == count - 1 ? count - 2 : vm.selected;
      vm.colors.splice(vm.selected, 1);
      vm.selectColor(count);
      setBtnState();
    }

  }
})();
