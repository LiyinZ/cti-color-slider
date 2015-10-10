(function() {
  'use strict';

  var demo = angular.module('ctiCpDemo', [ 'ctiColorSlider' ]);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope'];

  /* @ngInject */
  function MainCtrl($scope) {
    var vm = this;

    vm.colors = [
      { hex: '#FFF062' },
      { hex: '#00E594' },
      { hex: '#7862FF' }
    ];

    vm.colorData = vm.colors[0];

    vm.selectColor = function(key) {
      vm.colorData = vm.colors[key];
    }

  }
})();
