(function() {
  'use strict';

  var demo = angular.module('ctiCpDemo', [ 'ctiColorSlider' ]);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope'];

  /* @ngInject */
  function MainCtrl($scope) {
    var vm = this;

    vm.colors = [
      { hex: '#FFF062', rgb: 'rgb(255,141,200)' },
      { hex: '#00E594', rgb: 'rgb(255,240,98)' },
      { hex: '#7862FF', rgb: 'rgb(0,169,180)' }
    ];

    vm.colorData = vm.colors[0];

    vm.selectColor = function(key) {
      vm.colorData = vm.colors[key];
    }

  }
})();
