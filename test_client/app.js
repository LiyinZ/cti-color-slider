(function() {
  'use strict';

  var demo = angular.module('ctiCsDemo', ['ctiColorSlider', 'firebase']);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$firebaseObject'];

  /* @ngInject */
  function MainCtrl($scope, $firebaseObject) {
    var vm = this;
    var MAX_COUNT = 8;
    var MIN_COUNT = 0;
    var ref = new Firebase('https://cticolorslider.firebaseio.com/');
    var fb = $firebaseObject(ref);
    vm.ready = false;
    vm.colorData = null; // init selected color to first one;
    vm.disableAdd = vm.disableRm = true;

    fb.$loaded()
      .then(function(data) {
        vm.colors = data.colors || [];
        vm.selected = data.selected || 0;
        vm.colorData = vm.colors[vm.selected];
        vm.disableAdd = maxReached();
        vm.disableRm = minReached();
        vm.ready = true;
      })
      .catch(function(error) {
        console.error('Error', error);
      });

    vm.selectColor = selectColor;
    vm.isSelected = isSelected;
    vm.addColor = addColor;
    vm.removeColor = removeColor;
    vm.saveColors = saveColors;

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
      vm.selected = key > -1 ? key : 0;
      vm.colorData = vm.colors[key];
    }

    function isSelected(key) {
      return vm.selected == key;
    }

    function addColor() {
      if (!vm.ready) return;
      var count = vm.colors.length;
      if (count >= MAX_COUNT) return;
      vm.colors.push({  rgb: 'rgb(255,0,0)' });
      vm.selectColor(count);
      setBtnState();
    }

    function removeColor() {
      if (!vm.ready) return;
      var count = vm.colors.length;
      if (count <= MIN_COUNT) return;
      count = vm.selected == count - 1 ? count - 2 : vm.selected;
      vm.colors.splice(vm.selected, 1);
      vm.selectColor(count);
      setBtnState();
    }

    function saveColors() {
      if (!vm.ready) return;
      fb.colors = vm.colors;
      fb.selected = vm.selected;
      fb.$save().then(function(ref) {
        console.log('Colors saved!');
      }, function(err) {
        console.log('Error:', error);
      });
    }

  }
})();
